import Link from "next/link";
import { ArrowUpRight, Boxes, Eye, MessageSquareText, PackageCheck } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";

/* eslint-disable react-hooks/purity -- this dynamic server dashboard intentionally uses the request time */

export const metadata = { title: "Overview" };

export default async function AdminDashboardPage() {
  const { profile, supabase } = await requireAdmin();
  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const [rfq, samples, products, visitors, recentRfq, recentSamples, events] = await Promise.all([
    supabase.from("quote_requests").select("id", { count: "exact", head: true }).gte("created_at", since),
    supabase.from("sample_requests").select("id", { count: "exact", head: true }).gte("created_at", since),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("site_events").select("visitor_hash", { count: "exact", head: true }).gte("created_at", since).eq("event_type", "page_view"),
    supabase.from("quote_requests").select("id,inquiry_reference,company_name,country,status,created_at").order("created_at", { ascending: false }).limit(4),
    supabase.from("sample_requests").select("id,inquiry_reference,company_name,country,status,created_at").order("created_at", { ascending: false }).limit(3),
    supabase.from("site_events").select("created_at").gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString()).order("created_at"),
  ]);
  const recent = [...(recentRfq.data ?? []).map((item) => ({ ...item, type: "RFQ" })), ...(recentSamples.data ?? []).map((item) => ({ ...item, type: "Sample" }))]
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 6);
  const byDay = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(Date.now() - (6 - offset) * 86400000).toISOString().slice(0, 10);
    return events.data?.filter((event) => event.created_at.slice(0, 10) === date).length ?? 0;
  });
  const chartMax = Math.max(...byDay, 1);
  return <>
    <div className="admin-page-head"><div><h1>Good day, {profile.full_name.split(" ")[0]}.</h1><p>Here is the latest commercial activity across Ask Global.</p></div><div className="admin-page-actions"><Link className="admin-secondary-button" href="/admin/content">Edit website</Link><Link className="admin-primary-button" href="/admin/inquiries">Open CRM <ArrowUpRight size={15} /></Link></div></div>
    <section className="admin-stat-grid">
      <article className="admin-stat-card"><span><Eye size={18} /></span><small>Website visitors</small><strong>{visitors.count ?? 0}</strong><p>Last 30 days</p></article>
      <article className="admin-stat-card"><span><MessageSquareText size={18} /></span><small>Quotation requests</small><strong>{rfq.count ?? 0}</strong><p><b>Qualified buyer leads</b></p></article>
      <article className="admin-stat-card"><span><PackageCheck size={18} /></span><small>Sample requests</small><strong>{samples.count ?? 0}</strong><p>Last 30 days</p></article>
      <article className="admin-stat-card"><span><Boxes size={18} /></span><small>Published products</small><strong>{products.count ?? 0}</strong><p>Live catalogue</p></article>
    </section>
    <section className="admin-grid-2">
      <article className="admin-card"><div className="admin-card-head"><div><h2>Recent buyer inquiries</h2><p>RFQ and sample request activity</p></div><Link href="/admin/inquiries">View all →</Link></div>
        {recent.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Reference</th><th>Company</th><th>Country</th><th>Status</th></tr></thead><tbody>{recent.map((item) => <tr key={`${item.type}-${item.id}`}><td><strong>{item.inquiry_reference}</strong><small>{item.type}</small></td><td>{item.company_name}</td><td>{item.country}</td><td><span className={`admin-badge ${item.status}`}>{item.status}</span></td></tr>)}</tbody></table></div> : <div className="admin-empty"><MessageSquareText /><h3>No inquiries yet</h3><p>New buyer inquiries will appear here.</p></div>}
      </article>
      <article className="admin-card"><div className="admin-card-head"><div><h2>Traffic pulse</h2><p>Tracked website events · 7 days</p></div><Link href="/admin/seo">SEO settings</Link></div><div className="admin-chart">{byDay.map((count, index) => <span key={index} title={`${count} events`} style={{ height: `${Math.max(5, count / chartMax * 100)}%` }} />)}</div><div className="admin-chart-legend"><span>7 days ago</span><span>Today</span></div></article>
    </section>
  </>;
}
