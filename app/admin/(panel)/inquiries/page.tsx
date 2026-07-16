import Link from "next/link";
import { Download, Inbox } from "lucide-react";
import { updateInquiryStatusAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata = { title: "Inquiry CRM" };

type Inquiry = Record<string, string | number | boolean | null> & { id:number;inquiry_reference:string;company_name:string;contact_person:string;business_email:string;country:string;status:string;created_at:string };

export default async function InquiriesPage({ searchParams }: { searchParams: Promise<{ type?: string; status?: string }> }) {
  const { supabase } = await requireAdmin("inquiries.read");
  const params = await searchParams; const type = params.type === "sample" ? "sample" : "rfq";
  const table = type === "sample" ? "sample_requests" : "quote_requests";
  let query = supabase.from(table).select("*").order("created_at", { ascending: false }).limit(200);
  if (params.status && params.status !== "all") query = query.eq("status", params.status);
  const { data } = await query; const inquiries = (data ?? []) as Inquiry[];
  const statusOptions = type === "sample" ? ["new","reviewing","approved","declined","dispatched"] : ["new","contacted","qualified","closed"];
  return <><div className="admin-page-head"><div><h1>Inquiry CRM</h1><p>Qualify buyer requests, track follow-up status, and export leads for commercial workflows.</p></div><div className="admin-page-actions"><Link className="admin-secondary-button" href={`/api/admin/inquiries/export?type=${type}`}><Download size={14} />Export CSV</Link></div></div>
    <nav className="admin-tabs"><Link className={type === "rfq" ? "active" : ""} href="/admin/inquiries?type=rfq">Quotation requests</Link><Link className={type === "sample" ? "active" : ""} href="/admin/inquiries?type=sample">Sample requests</Link></nav>
    <div className="admin-card"><div className="admin-card-head"><div><h2>{type === "rfq" ? "Request for quotation" : "Sample requests"}</h2><p>{inquiries.length} records · newest first</p></div><div className="admin-tabs" style={{margin:0}}><Link className={!params.status || params.status === "all" ? "active" : ""} href={`/admin/inquiries?type=${type}&status=all`}>All</Link>{statusOptions.map((status) => <Link key={status} className={params.status === status ? "active" : ""} href={`/admin/inquiries?type=${type}&status=${status}`}>{status}</Link>)}</div></div>
      {inquiries.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Buyer</th><th>Country</th><th>Requirement</th><th>Submitted</th><th>Status</th></tr></thead><tbody>{inquiries.map((item) => <tr key={item.id}><td><strong>{item.company_name}</strong><small>{item.contact_person} · {item.business_email}</small></td><td>{item.country}</td><td><strong>{String(type === "rfq" ? item.product_interested : item.product)}</strong><small>{String(type === "rfq" ? item.quantity_required : item.expected_future_order_volume)}</small></td><td>{new Date(item.created_at).toLocaleDateString("en-GB")}<small>{item.inquiry_reference}</small></td><td><form action={updateInquiryStatusAction} className="admin-inline-form"><input type="hidden" name="type" value={type} /><input type="hidden" name="id" value={item.id} /><select name="status" defaultValue={item.status}>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select><button>Update</button></form></td></tr>)}</tbody></table></div> : <div className="admin-empty"><Inbox size={26} /><h3>No matching inquiries</h3><p>Try another status filter.</p></div>}
    </div></>;
}
