import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const required = ["companyName", "contactPerson", "email", "country", "quantity"] as const;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.website) return NextResponse.json({ ok: true });
    for (const field of required) {
      if (typeof body[field] !== "string" || !body[field].trim()) return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return NextResponse.json({ error: "Please enter a valid business email address." }, { status: 400 });

    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) return NextResponse.json({ error: "Online inquiries are being configured. Please contact us by WhatsApp for now." }, { status: 503 });

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await supabase.from("quote_requests").insert({
      company_name: body.companyName.trim().slice(0,120), contact_person: body.contactPerson.trim().slice(0,100),
      email: body.email.trim().toLowerCase().slice(0,160), country: body.country.trim().slice(0,80),
      quantity_required: body.quantity.trim().slice(0,80), packaging_requirement: String(body.packaging || "").slice(0,120),
      incoterm: String(body.incoterm || "").slice(0,20), additional_notes: String(body.notes || "").slice(0,1500),
      source_page: "/products/vanilla-beans",
    });
    if (error) throw error;
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "We could not submit your inquiry. Please try again or contact us by WhatsApp." }, { status: 500 });
  }
}
