import { NextResponse } from "next/server";
import { sampleSchema } from "@/lib/inquiry-validation";
import { getSupabaseAdmin, inquiryReference, isRateLimited } from "@/lib/inquiry-server";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(`sample:${ip}`)) return NextResponse.json({ error: "Please wait before submitting another request." }, { status: 429 });
    const parsed = sampleSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Please check the form." }, { status: 400 });
    if (parsed.data.website) return NextResponse.json({ ok: true, reference: "ASK-RECEIVED" });
    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: "Sample requests are being configured. Please use WhatsApp for immediate assistance." }, { status: 503 });
    const reference = inquiryReference("SMP"); const data = parsed.data;
    const { error } = await supabase.from("sample_requests").insert({ inquiry_reference: reference, company_name: data.companyName,
      contact_person: data.contactPerson, business_email: data.email, country: data.country, product: data.product, required_grade: data.grade,
      intended_use: data.intendedUse, expected_future_order_volume: data.expectedVolume, shipping_address: data.shippingAddress,
      courier_account: data.courierAccount || null, additional_notes: data.notes || null, consent: data.consent, source_page: data.sourcePage || "/products" });
    if (error) throw error;
    return NextResponse.json({ ok: true, reference }, { status: 201 });
  } catch { return NextResponse.json({ error: "We could not submit your request. Please try again or use WhatsApp." }, { status: 500 }); }
}
