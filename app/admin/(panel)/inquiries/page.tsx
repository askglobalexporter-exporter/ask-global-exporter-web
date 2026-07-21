import Link from "next/link";
import { Download, Inbox } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { InquiryTable, type InquiryRow } from "@/components/admin/InquiryTable";

export const metadata = { title: "Inquiry CRM" };

const PAGE_SIZE = 25;

export default async function InquiriesPage({ searchParams }: { searchParams: Promise<{ type?: string; status?: string; page?: string }> }) {
  const { supabase } = await requireAdmin("inquiries.read");
  const params = await searchParams; const type = params.type === "sample" ? "sample" : "rfq";
  const table = type === "sample" ? "sample_requests" : "quote_requests";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const columns = type === "sample"
    ? "id,inquiry_reference,company_name,contact_person,business_email,country,status,created_at,product,expected_future_order_volume"
    : "id,inquiry_reference,company_name,contact_person,business_email,country,status,created_at,product_interested,quantity_required";
  let query = supabase.from(table).select(columns, { count: "exact" }).order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);
  if (params.status && params.status !== "all") query = query.eq("status", params.status);
  const { data, count } = await query; const inquiries = (data ?? []) as unknown as InquiryRow[];
  const pageCount = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  const statusOptions = type === "sample" ? ["new","reviewing","approved","declined","dispatched"] : ["new","contacted","qualified","closed"];
  return <><div className="admin-page-head"><div><h1>Inquiry CRM</h1><p>Qualify buyer requests, track follow-up status, and export leads for commercial workflows.</p></div><div className="admin-page-actions"><Link className="admin-secondary-button" href={`/api/admin/inquiries/export?type=${type}`}><Download size={14} />Export CSV</Link></div></div>
    <nav className="admin-tabs"><Link className={type === "rfq" ? "active" : ""} href="/admin/inquiries?type=rfq">Quotation requests</Link><Link className={type === "sample" ? "active" : ""} href="/admin/inquiries?type=sample">Sample requests</Link></nav>
    <div className="admin-card"><div className="admin-card-head"><div><h2>{type === "rfq" ? "Request for quotation" : "Sample requests"}</h2><p>{count ?? 0} records · newest first</p></div><div className="admin-tabs" style={{margin:0}}><Link className={!params.status || params.status === "all" ? "active" : ""} href={`/admin/inquiries?type=${type}&status=all`}>All</Link>{statusOptions.map((status) => <Link key={status} className={params.status === status ? "active" : ""} href={`/admin/inquiries?type=${type}&status=${status}`}>{status}</Link>)}</div></div>
      {inquiries.length ? <InquiryTable inquiries={inquiries} type={type} statusOptions={statusOptions} queryKey={`${type}:${params.status ?? "all"}:${page}`}/> : <div className="admin-empty"><Inbox size={26} /><h3>No matching inquiries</h3><p>Try another status filter.</p></div>}
      <AdminPagination basePath="/admin/inquiries" page={page} pageCount={pageCount} params={{ type, status: params.status ?? "all" }} />
    </div></>;
}
