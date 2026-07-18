import { NextResponse } from "next/server";
import { testimonialSchema } from "@/lib/inquiry-validation";
import { getSupabaseAdmin, isRateLimited, verifyTurnstile } from "@/lib/inquiry-server";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (await isRateLimited("testimonial", ip)) {
      return NextResponse.json({ error: "Too many submissions. Please wait 15 minutes before trying again." }, { status: 429 });
    }
    const parsed = testimonialSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Please check the form." }, { status: 400 });
    if (parsed.data.website) return NextResponse.json({ ok: true });
    if (!await verifyTurnstile(parsed.data.turnstileToken, ip)) {
      return NextResponse.json({ error: "Please complete the spam protection check and try again." }, { status: 400 });
    }
    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: "Testimonial submissions are being configured. Please try again later." }, { status: 503 });
    const data = parsed.data;
    const slug = `buyer-submission-${crypto.randomUUID()}`;
    const { error } = await supabase.from("cms_entries").insert({
      collection: "testimonial",
      slug,
      title: data.name,
      excerpt: null,
      content: {
        body: data.testimonial,
        author: data.name,
        company: data.company,
        role: data.role || "",
        submitted_via: "public_form",
        publication_consent: true,
      },
      status: "draft",
      published_at: null,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "We could not submit your testimonial. Please try again later." }, { status: 500 });
  }
}
