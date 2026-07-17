import Link from "next/link";
import { FileText, Plus, Trash2 } from "lucide-react";
import { deleteCmsEntryAction, saveCmsEntryAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin/auth";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { AdminLivePreview } from "@/components/admin/AdminLivePreview";
import { AdminLazyDetails } from "@/components/admin/AdminLazyDetails";
import { AdminPagination } from "@/components/admin/AdminPagination";

const collections = ["homepage","about","faq","testimonial","blog","export_document","company_profile"];
const collectionLabels: Record<string,string> = { homepage:"Beranda",about:"Tentang kami",faq:"FAQ",testimonial:"Testimoni",blog:"Blog",export_document:"Dokumen ekspor",company_profile:"Profil perusahaan" };
export const metadata = { title: "Content" };

type CmsRow = { id:string;collection:string;slug:string;title:string;excerpt:string|null;content:{body?:string;cta_label?:string;cta_url?:string};status:string;featured_image_url:string|null;updated_at:string };

function CmsFields({ collection, entry }: { collection: string; entry?: CmsRow }) {
  return <div className="admin-form-grid"><input type="hidden" name="id" value={entry?.id ?? ""} /><input type="hidden" name="collection" value={collection} />
    <label><span>{collection === "faq" ? "Pertanyaan" : "Judul"}</span><input name="title" defaultValue={entry?.title} required /></label><label><span>Alamat halaman (slug)</span><input name="slug" defaultValue={entry?.slug} /><small>Biarkan kosong agar dibuat otomatis.</small></label>
    <label><span>Status publikasi</span><select name="status" defaultValue={entry?.status ?? "draft"}><option value="draft">Draft — belum tampil</option><option value="published">Terbit — tampil di website</option><option value="archived">Arsip</option></select></label>
    <ImageUploadField name="featured_image_url" label="Foto utama" defaultValue={entry?.featured_image_url ?? ""} folder={collection === "blog" ? "blog" : "content"} />
    <label className="admin-field-full"><span>Ringkasan</span><textarea name="excerpt" rows={2} defaultValue={entry?.excerpt ?? ""} /></label><label className="admin-field-full"><span>{collection === "faq" ? "Jawaban" : "Isi konten"}</span><textarea name="body" rows={7} defaultValue={entry?.content?.body ?? ""} /></label>
    <label><span>Teks tombol</span><input name="cta_label" defaultValue={entry?.content?.cta_label ?? ""} /></label><label><span>Tujuan tombol</span><input name="cta_url" defaultValue={entry?.content?.cta_url ?? ""} /></label>
  </div>;
}

const PAGE_SIZE = 10;

export default async function ContentAdminPage({ searchParams }: { searchParams: Promise<{ collection?: string; page?: string }> }) {
  const { profile, supabase } = await requireAdmin("content.read");
  const allowedCollections = profile.role === "marketing" ? ["testimonial","blog"] : collections;
  const params = await searchParams; const collection = allowedCollections.includes(params.collection ?? "") ? params.collection! : allowedCollections[0];
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const { data, count } = await supabase.from("cms_entries").select("*", { count: "exact" }).eq("collection", collection).order("updated_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);
  const entries = (data ?? []) as CmsRow[];
  const pageCount = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  return <><div className="admin-page-head"><div><h1>Kelola konten</h1><p>Pilih jenis konten, isi formulir sederhana, periksa preview, lalu simpan sebagai draft atau terbitkan.</p></div></div><nav className="admin-tabs">{allowedCollections.map((item) => <Link key={item} className={collection === item ? "active" : ""} href={`/admin/content?collection=${item}`}>{collectionLabels[item]}</Link>)}</nav>
    <div className="admin-split"><article className="admin-card"><div className="admin-card-head"><div><h2><Plus size={14} /> Tambah {collectionLabels[collection]}</h2><p>Preview berubah otomatis saat Anda mengetik.</p></div></div><form action={saveCmsEntryAction} className="admin-form"><CmsFields collection={collection} /><AdminLivePreview kind="content" label={`Preview ${collectionLabels[collection]}`}/><div className="admin-form-actions"><SubmitButton pendingLabel="Membuat…">Buat konten</SubmitButton></div></form></article>
      <section>{entries.length ? entries.map((entry) => <AdminLazyDetails key={entry.id} summary={<><span className="admin-list-thumb" style={{display:"grid",placeItems:"center"}}><FileText size={18} /></span><div><b>{entry.title}</b><small>/{entry.slug} · Diperbarui {new Date(entry.updated_at).toLocaleDateString("id-ID")}</small></div><span className={`admin-badge ${entry.status}`}>{entry.status}</span></>}><div className="admin-list-card-body"><form action={saveCmsEntryAction} className="admin-form"><CmsFields collection={collection} entry={entry} /><AdminLivePreview kind="content" label="Preview perubahan"/><div className="admin-form-actions"><SubmitButton>Simpan perubahan</SubmitButton></div></form><form action={deleteCmsEntryAction} className="admin-form-actions"><input type="hidden" name="id" value={entry.id} /><input type="hidden" name="collection" value={collection}/><SubmitButton className="admin-danger-button" pendingLabel="Menghapus…"><Trash2 size={13} />Hapus konten</SubmitButton></form></div></AdminLazyDetails>) : <div className="admin-card admin-empty"><FileText size={24} /><h3>Belum ada {collectionLabels[collection]}</h3><p>Gunakan formulir di sebelah kiri untuk membuat konten pertama.</p></div>}<AdminPagination basePath="/admin/content" page={page} pageCount={pageCount} params={{ collection }} /></section></div></>;
}
