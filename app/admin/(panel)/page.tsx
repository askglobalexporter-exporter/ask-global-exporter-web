import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight, Boxes, Eye, MessageSquareText, PackageCheck } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { roleCan } from "@/lib/admin/types";

/* eslint-disable react-hooks/purity -- request-time dashboard windows intentionally use the current server time */

export const metadata = { title: "Ringkasan" };

type RankedItem = { label: string; count: number };
type DailyItem = { date: string; count: number };
type DashboardAnalytics = {
  unique_visitors: number;
  by_day: DailyItem[];
  top_countries: RankedItem[];
  popular_products: RankedItem[];
};

const emptyAnalytics: DashboardAnalytics = {
  unique_visitors: 0,
  by_day: [],
  top_countries: [],
  popular_products: [],
};

function normalizeAnalytics(value: unknown): DashboardAnalytics {
  if (!value || typeof value !== "object") return emptyAnalytics;
  const data = value as Partial<DashboardAnalytics>;
  return {
    unique_visitors: Number(data.unique_visitors ?? 0),
    by_day: Array.isArray(data.by_day) ? data.by_day.map((item) => ({ date: String(item.date), count: Number(item.count) })) : [],
    top_countries: Array.isArray(data.top_countries) ? data.top_countries.map((item) => ({ label: String(item.label), count: Number(item.count) })) : [],
    popular_products: Array.isArray(data.popular_products) ? data.popular_products.map((item) => ({ label: String(item.label), count: Number(item.count) })) : [],
  };
}

async function DashboardData() {
  const { supabase } = await requireAdmin();
  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const [rfq, samples, products, recentRfq, recentSamples, analyticsResult] = await Promise.all([
    supabase.from("quote_requests").select("id", { count: "exact", head: true }).gte("created_at", since),
    supabase.from("sample_requests").select("id", { count: "exact", head: true }).gte("created_at", since),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("quote_requests").select("id,inquiry_reference,company_name,country,status,created_at").order("created_at", { ascending: false }).limit(4),
    supabase.from("sample_requests").select("id,inquiry_reference,company_name,country,status,created_at").order("created_at", { ascending: false }).limit(3),
    supabase.rpc("admin_dashboard_analytics", { p_days: 30 }),
  ]);
  const analytics = analyticsResult.error ? emptyAnalytics : normalizeAnalytics(analyticsResult.data);
  const recent = [
    ...(recentRfq.data ?? []).map((item) => ({ ...item, type: "RFQ" })),
    ...(recentSamples.data ?? []).map((item) => ({ ...item, type: "Sample" })),
  ].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 6);
  const byDay = analytics.by_day.length === 7 ? analytics.by_day.map((item) => item.count) : Array(7).fill(0);
  const chartMax = Math.max(...byDay, 1);

  return <>
    <section className="admin-stat-grid">
      <article className="admin-stat-card"><span><Eye size={18} /></span><small>Pengunjung unik</small><strong>{analytics.unique_visitors}</strong><p>30 hari terakhir</p></article>
      <article className="admin-stat-card"><span><MessageSquareText size={18} /></span><small>Permintaan penawaran</small><strong>{rfq.count ?? 0}</strong><p><b>Prospek buyer</b></p></article>
      <article className="admin-stat-card"><span><PackageCheck size={18} /></span><small>Permintaan sampel</small><strong>{samples.count ?? 0}</strong><p>30 hari terakhir</p></article>
      <article className="admin-stat-card"><span><Boxes size={18} /></span><small>Produk terbit</small><strong>{products.count ?? 0}</strong><p>Katalog aktif</p></article>
    </section>
    <section className="admin-grid-2">
      <article className="admin-card"><div className="admin-card-head"><div><h2>Permintaan buyer terbaru</h2><p>Aktivitas RFQ dan permintaan sampel</p></div><Link href="/admin/inquiries">Lihat semua →</Link></div>
        {recent.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Referensi</th><th>Perusahaan</th><th>Negara</th><th>Status</th></tr></thead><tbody>{recent.map((item) => <tr key={`${item.type}-${item.id}`}><td><strong>{item.inquiry_reference}</strong><small>{item.type}</small></td><td>{item.company_name}</td><td>{item.country}</td><td><span className={`admin-badge ${item.status}`}>{item.status}</span></td></tr>)}</tbody></table></div> : <div className="admin-empty"><MessageSquareText /><h3>Belum ada permintaan</h3><p>Permintaan buyer baru akan muncul di sini.</p></div>}
      </article>
      <article className="admin-card"><div className="admin-card-head"><div><h2>Aktivitas kunjungan</h2><p>Data ringkas · 7 hari</p></div><Link href="/admin/seo">Pengaturan SEO</Link></div><div className="admin-chart">{byDay.map((count, index) => <span key={index} title={`${count} kunjungan`} style={{ height: `${Math.max(5, count / chartMax * 100)}%` }} />)}</div><div className="admin-chart-legend"><span>7 hari lalu</span><span>Hari ini</span></div></article>
    </section>
    <section className="admin-grid-2 admin-ranking-grid">
      <article className="admin-card"><div className="admin-card-head"><div><h2>Negara teratas</h2><p>30 hari terakhir</p></div></div><ol className="admin-ranking-list">{analytics.top_countries.length ? analytics.top_countries.map((item) => <li key={item.label}><span>{item.label}</span><b>{item.count} kunjungan</b></li>) : <li><span>Belum ada data negara</span></li>}</ol></article>
      <article className="admin-card"><div className="admin-card-head"><div><h2>Produk populer</h2><p>30 hari terakhir</p></div></div><ol className="admin-ranking-list">{analytics.popular_products.length ? analytics.popular_products.map((item) => <li key={item.label}><span>{item.label.replaceAll("-", " ")}</span><b>{item.count} kunjungan</b></li>) : <li><span>Belum ada kunjungan produk</span></li>}</ol></article>
    </section>
  </>;
}

function DashboardFallback() {
  return <div className="admin-loading admin-dashboard-loading" role="status" aria-label="Memuat ringkasan dashboard">
    <div className="admin-loading-grid">{Array.from({ length: 4 }, (_, index) => <span key={index} />)}</div>
    <div className="admin-loading-panel" />
  </div>;
}

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { profile } = await requireAdmin();
  const query = await searchParams;
  return <>
    <div className="admin-page-head"><div><h1>Halo, {profile.full_name.split(" ")[0]}.</h1><p>Ringkasan aktivitas komersial terbaru Ask Global.</p></div><div className="admin-page-actions">{roleCan(profile.role, "content.read") && <Link className="admin-secondary-button" href="/admin/content">Edit website</Link>}{roleCan(profile.role, "inquiries.read") && <Link className="admin-primary-button" href="/admin/inquiries">Buka CRM <ArrowUpRight size={15} /></Link>}</div></div>
    {query.error === "forbidden" && <div className="admin-alert error">Akun Anda tidak memiliki akses ke menu tersebut.</div>}
    <Suspense fallback={<DashboardFallback />}><DashboardData /></Suspense>
  </>;
}
