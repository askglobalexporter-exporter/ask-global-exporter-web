import { NextResponse } from "next/server";
import { quotationSchema } from "@/lib/inquiry-validation";
import { sendInquiryNotification } from "@/lib/inquiry-notification";
import { getSupabaseAdmin, inquiryReference, isRateLimited, verifyTurnstile } from "@/lib/inquiry-server";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (await isRateLimited("quote", ip)) return NextResponse.json({ error: "Too many inquiries. Please wait 15 minutes before trying again." }, { status: 429 });
    const parsed = quotationSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Please check the form." }, { status: 400 });
    if (parsed.data.website) return NextResponse.json({ ok: true, reference: "ASK-RECEIVED" });
    if (!await verifyTurnstile(parsed.data.turnstileToken, ip)) return NextResponse.json({ error: "Please complete the spam protection check and try again." }, { status: 400 });
    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: "Online inquiries are being configured. Please use WhatsApp for immediate assistance." }, { status: 503 });
    const reference = inquiryReference("RFQ"); const data = parsed.data;
    const { error } = await supabase.from("quote_requests").insert({
      inquiry_reference: reference, company_name: data.companyName, contact_person: data.contactPerson, business_email: data.email,
      phone_whatsapp: data.phone, country: data.country, company_website: data.companyWebsite || null, product_interested: data.product,
      grade: data.grade, quantity_required: data.quantity, preferred_packaging: data.packaging, destination_port: data.destinationPort,
      preferred_incoterm: data.incoterm, sample_required: data.sampleRequired === "yes", additional_requirements: data.notes || null,
      consent: data.consent, source_page: data.sourcePage || "/products",
    });
    if (error) throw error;
    await supabase.from("site_events").insert({ event_type: "rfq_submitted", path: data.sourcePage || "/products", product_slug: data.product });
    await sendInquiryNotification({
      reference, type: "RFQ", companyName: data.companyName, contactPerson: data.contactPerson, email: data.email,
      country: data.country, product: data.product, details: [["Phone / WhatsApp", data.phone], ["Grade", data.grade],
        ["Quantity", data.quantity], ["Packaging", data.packaging], ["Destination", data.destinationPort],
        ["Incoterm", data.incoterm], ["Sample required", data.sampleRequired], ["Notes", data.notes]],
    }).catch((notificationError) => console.error("RFQ notification failed", notificationError));
    return NextResponse.json({ ok: true, reference }, { status: 201 });
  } catch { return NextResponse.json({ error: "We could not submit your inquiry. Please try again or use WhatsApp." }, { status: 500 }); }
}
