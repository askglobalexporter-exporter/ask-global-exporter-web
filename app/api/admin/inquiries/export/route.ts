import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { roleCan } from "@/lib/admin/types";

function csvValue(value: unknown) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session || !roleCan(session.profile.role, "inquiries.read")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const type = request.nextUrl.searchParams.get("type") === "sample" ? "sample" : "rfq";
  const table = type === "sample" ? "sample_requests" : "quote_requests";
  const { data, error } = await session.supabase.from(table).select("*").order("created_at", { ascending: false }).limit(5000);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const rows = data ?? []; const headers = rows.length ? Object.keys(rows[0]) : ["id","inquiry_reference","created_at","status"];
  const csv = [headers.map(csvValue).join(","), ...rows.map((row) => headers.map((header) => csvValue((row as Record<string, unknown>)[header])).join(","))].join("\r\n");
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="ask-global-${type}-${new Date().toISOString().slice(0,10)}.csv"`, "Cache-Control": "no-store" } });
}
