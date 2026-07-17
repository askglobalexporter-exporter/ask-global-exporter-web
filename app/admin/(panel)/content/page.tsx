import Image from "next/image";
import Link from "next/link";
import { FileText, Pencil, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { allowedCmsCollections, cmsCollectionLabels } from "@/lib/admin/cms";

export const metadata = { title: "Konten Website" };
const PAGE_SIZE = 10;

type CmsRow = { id:string;slug:string;title:string;excerpt:string|null;status:string;featured_image_url:string|null;updated_at:string };

export default async function ContentAdminPage({ searchParams }: { searchParams: Promise<{ collection?: string; page?: string }> }) {
  const { profile, supabase } = await requireAdmin("content.read");
  const allowed = allowedCmsCollections(profile.role);
  const params = await searchParams;
  const collection = allowed.includes(params.collection as never) ? params.collection as typeof allowed[number] : allowed[0];
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const { data, count } = await supabase.from("cms_entries").select("id,slug,title,excerpt,status,featured_image_url,updated_at", { count:"exact" }).eq("collection", collection).order("updated_at", { ascending:false }).range(from, from + PAGE_SIZE - 1);
  const entries = (data ?? []) as CmsRow[];
  const pageCount = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return <>
    <div className="admin-page-head"><div><h1>Konten website</h1><p>Pilih jenis konten, lalu tambah konten baru atau edit konten yang sudah tayang.</p></div><div className="admin-page-actions"><Link className="admin-primary-button" href={`/admin/content/new?collection=${collection}`}><Plus size={15} /> Tambah {cmsCollectionLabels[collection]}</Link></div></div>
    <nav className="admin-tabs">{allowed.map((item)=><Link key={item} className={collection === item ? "active" : ""} href={`/admin/content?collection=${item}`}>{cmsCollectionLabels[item]}</Link>)}</nav>
    <section className="admin-card admin-content-list">
      <div className="admin-card-head"><div><h2>Daftar {cmsCollectionLabels[collection]}</h2><p>{count ?? 0} konten · klik Edit untuk mengubah konten yang sudah ada</p></div></div>
      {entries.length ? <div className="admin-content-rows">{entries.map((entry)=><article key={entry.id} className="admin-content-row">
        {entry.featured_image_url ? <Image src={entry.featured_image_url} alt="" width={68} height={54} unoptimized /> : <span className="admin-content-row-icon"><FileText size={20} /></span>}
        <div><b>{entry.title}</b><p>{entry.excerpt || `/${entry.slug}`}</p><small>Diperbarui {new Date(entry.updated_at).toLocaleDateString("id-ID")}</small></div>
        <span className={`admin-badge ${entry.status}`}>{entry.status === "published" ? "Terbit" : entry.status === "draft" ? "Draft" : "Arsip"}</span>
        <Link className="admin-secondary-button" href={`/admin/content/${entry.id}/edit`}><Pencil size={13} /> Edit</Link>
      </article>)}</div> : <div className="admin-empty"><FileText size={25} /><h3>Belum ada {cmsCollectionLabels[collection]}</h3><p>Klik tombol Tambah untuk membuat konten pertama.</p></div>}
      <AdminPagination basePath="/admin/content" page={page} pageCount={pageCount} params={{collection}} />
    </section>
  </>;
}
