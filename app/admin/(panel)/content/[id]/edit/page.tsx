import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { deleteCmsEntryAction } from "@/app/admin/actions";
import { CmsEntryEditor, type CmsEditorEntry } from "@/components/admin/CmsEntryEditor";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { requireAdmin } from "@/lib/admin/auth";
import { allowedCmsCollections, cmsCollectionLabels, isCmsCollection } from "@/lib/admin/cms";

export const metadata = { title: "Edit Konten" };

export default async function EditContentPage({ params, searchParams }: { params:Promise<{id:string}>;searchParams:Promise<{saved?:string}> }) {
  const { profile, supabase } = await requireAdmin("content.read");
  const { id } = await params;
  const query = await searchParams;
  const { data } = await supabase.from("cms_entries").select("id,collection,slug,title,excerpt,content,status,featured_image_url").eq("id", id).maybeSingle();
  if (!data || !isCmsCollection(data.collection) || !allowedCmsCollections(profile.role).includes(data.collection)) notFound();
  const entry = data as CmsEditorEntry;
  return <>
    <Link className="admin-back-link" href={`/admin/content?collection=${entry.collection}`}><ArrowLeft size={14} /> Kembali ke daftar</Link>
    <div className="admin-page-head"><div><h1>Edit: {entry.title}</h1><p>Semua teks dan foto yang tersimpan sudah dimuat. Ubah bagian yang diperlukan saja.</p></div>{query.saved && <span className="admin-toast">Perubahan berhasil disimpan</span>}</div>
    <CmsEntryEditor collection={entry.collection as keyof typeof cmsCollectionLabels} entry={entry} mode="edit" />
    <form action={deleteCmsEntryAction} className="admin-delete-zone"><input type="hidden" name="id" value={entry.id}/><input type="hidden" name="collection" value={entry.collection}/><input type="hidden" name="redirect_to" value={`/admin/content?collection=${entry.collection}`}/><div><b>Hapus konten</b><p>Gunakan hanya jika konten ini benar-benar tidak diperlukan.</p></div><SubmitButton className="admin-danger-button" pendingLabel="Menghapus…"><Trash2 size={13}/> Hapus</SubmitButton></form>
  </>;
}
