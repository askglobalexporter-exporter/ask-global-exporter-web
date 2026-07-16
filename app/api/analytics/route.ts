import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/inquiry-server";

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok:true }, { status:202 });
  let body: { path?:string;event_type?:string;product_slug?:string|null };
  try { body = await request.json(); } catch { return NextResponse.json({ ok:false }, { status:400 }); }
  const path = String(body.path ?? "").slice(0,300); const eventType = body.event_type === "product_view" ? "product_view" : "page_view";
  if (!path.startsWith("/") || path.startsWith("/admin")) return NextResponse.json({ ok:false }, { status:400 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const visitorHash = createHash("sha256").update(`${ip}:${request.headers.get("user-agent") ?? ""}:${new Date().toISOString().slice(0,10)}`).digest("hex").slice(0,24);
  await supabase.from("site_events").insert({ event_type:eventType,path,product_slug:body.product_slug?.slice(0,120) ?? null,country_code:request.headers.get("x-vercel-ip-country")?.slice(0,2) ?? null,visitor_hash:visitorHash });
  return NextResponse.json({ ok:true }, { status:202 });
}
