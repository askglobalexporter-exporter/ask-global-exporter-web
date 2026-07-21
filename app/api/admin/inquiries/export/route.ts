import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { roleCan } from "@/lib/admin/types";

function csvValue(value: unknown) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session || !roleCan(session.profile.role, "inquiries.read")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const type = request.nextUrl.searchParams.get("type") === "sample" ? "sample" : "rfq";
  const table = type === "sample" ? "sample_requests" : "quote_requests";
  const columns:string = type === "sample"
    ? "id,inquiry_reference,created_at,company_name,contact_person,business_email,country,product,required_grade,intended_use,expected_future_order_volume,shipping_address,courier_account,additional_notes,status"
    : "id,inquiry_reference,created_at,company_name,contact_person,business_email,phone_whatsapp,country,company_website,product_interested,grade,quantity_required,preferred_packaging,destination_port,preferred_incoterm,sample_required,additional_requirements,status";
  const { data, error } = await session.supabase.from(table).select(columns).order("created_at", { ascending: false }).limit(5000);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const rows = data ?? []; const headers = rows.length ? Object.keys(rows[0]) : ["id","inquiry_reference","created_at","status"];
  const csv = [headers.map(csvValue).join(","), ...rows.map((row) => headers.map((header) => csvValue((row as unknown as Record<string, unknown>)[header])).join(","))].join("\r\n");
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="ask-global-${type}-${new Date().toISOString().slice(0,10)}.csv"`, "Cache-Control": "no-store" } });
}
