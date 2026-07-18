import { Save } from "lucide-react";
import { saveCmsEntryAction } from "@/app/admin/actions";
import { AdminLivePreview } from "./AdminLivePreview";
import { ImageUploadField } from "./ImageUploadField";
import { SubmitButton } from "./SubmitButton";
import { cmsCollectionLabels, type CmsCollection } from "@/lib/admin/cms";

export type CmsEditorEntry = {
  id: string;
  collection: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: { body?:string;cta_label?:string;cta_url?:string;question?:string;answer?:string;author?:string;company?:string;role?:string };
  status: string;
  featured_image_url: string | null;
};

const labels: Record<CmsCollection, { title:string; excerpt:string; body:string; help:string }> = {
  about: { title:"Judul bagian", excerpt:"Paragraf pembuka", body:"Paragraf lanjutan", help:"Konten ini tampil pada pengantar Tentang Ask Global." },
  faq: { title:"Pertanyaan", excerpt:"Ringkasan singkat (opsional)", body:"Jawaban", help:"Tulis satu pertanyaan dan jawaban dalam satu konten." },
  testimonial: { title:"Nama pemberi testimoni", excerpt:"Ringkasan (opsional)", body:"Isi testimoni", help:"Kiriman buyer masuk sebagai Draft. Periksa isinya, lalu pilih Terbit untuk menayangkan atau Arsip untuk menolaknya." },
  blog: { title:"Judul artikel", excerpt:"Ringkasan artikel", body:"Isi artikel", help:"Ringkasan tampil pada kartu; isi lengkap tampil pada halaman artikel." },
  export_document: { title:"Nama dokumen", excerpt:"Keterangan singkat", body:"Penjelasan tambahan", help:"Dokumen terbit akan tampil pada bagian compliance." },
  company_profile: { title:"Judul profil/prinsip", excerpt:"Paragraf pembuka", body:"Paragraf lanjutan", help:"Dipakai untuk cerita, prinsip, dan komitmen perusahaan." },
};

export function CmsEntryEditor({ collection, entry, mode }: { collection: CmsCollection; entry?: CmsEditorEntry; mode: "create" | "edit" }) {
  const field = labels[collection];
  const redirectTo = mode === "create" ? "/admin/content/:id/edit?saved=created" : `/admin/content/${entry!.id}/edit?saved=updated`;
  return <form action={saveCmsEntryAction} className="admin-form admin-editor-with-preview">
    <div className="admin-card admin-editor-fields">
      <input type="hidden" name="id" value={entry?.id ?? ""} />
      <input type="hidden" name="collection" value={collection} />
      <input type="hidden" name="redirect_to" value={redirectTo} />
      <div className="admin-card-head"><div><h2>{mode === "create" ? `Tambah ${cmsCollectionLabels[collection]}` : `Edit ${cmsCollectionLabels[collection]}`}</h2><p>{field.help}</p></div></div>
      <div className="admin-form-grid">
        <label className="admin-field-full"><span>{field.title}</span><input name="title" defaultValue={entry?.title} required /></label>
        <label><span>Alamat halaman</span><input name="slug" defaultValue={entry?.slug} placeholder="dibuat otomatis dari judul" /><small>Biasanya tidak perlu diubah.</small></label>
        <label><span>Status</span><select name="status" defaultValue={entry?.status ?? "draft"}><option value="draft">{collection === "testimonial" ? "Menunggu review — belum tampil" : "Draft — belum tampil"}</option><option value="published">Terbit — tampil di website</option><option value="archived">Arsip — tidak tampil</option></select></label>
        <label className="admin-field-full"><span>{field.excerpt}</span><textarea name="excerpt" rows={3} defaultValue={entry?.excerpt ?? ""} /></label>
        <label className="admin-field-full"><span>{field.body}</span><textarea name="body" rows={9} defaultValue={entry?.content?.body ?? entry?.content?.answer ?? ""} required={collection === "faq" || collection === "blog"} /></label>
        {collection === "testimonial" && <><label><span>Perusahaan</span><input name="company" defaultValue={entry?.content?.company ?? ""} /></label><label><span>Jabatan</span><input name="role" defaultValue={entry?.content?.role ?? ""} /></label></>}
        {!(["faq","testimonial","export_document"] as string[]).includes(collection) && <ImageUploadField name="featured_image_url" label="Foto utama" defaultValue={entry?.featured_image_url ?? ""} folder={collection === "blog" ? "blog" : "content"} />}
        {!["faq","testimonial","export_document"].includes(collection) && <><label><span>Teks tombol (opsional)</span><input name="cta_label" defaultValue={entry?.content?.cta_label ?? ""} /></label><label><span>Tujuan tombol (opsional)</span><input name="cta_url" defaultValue={entry?.content?.cta_url ?? ""} /></label></>}
      </div>
      <div className="admin-form-actions"><SubmitButton pendingLabel="Menyimpan…"><Save size={14} /> {mode === "create" ? "Simpan konten baru" : "Simpan perubahan"}</SubmitButton></div>
    </div>
    <aside className="admin-card admin-editor-preview"><AdminLivePreview kind="content" label="Preview tampilan publik" /></aside>
  </form>;
}
