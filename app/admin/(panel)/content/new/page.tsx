import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { allowedCmsCollections, cmsCollectionLabels } from "@/lib/admin/cms";
import { CmsEntryEditor } from "@/components/admin/CmsEntryEditor";

export const metadata = { title: "Tambah Konten" };

export default async function NewContentPage({ searchParams }: { searchParams: Promise<{ collection?: string }> }) {
  const { profile } = await requireAdmin("content.read");
  const allowed = allowedCmsCollections(profile.role);
  const params = await searchParams;
  const collection = allowed.includes(params.collection as never) ? params.collection as typeof allowed[number] : allowed[0];
  return <>
    <Link className="admin-back-link" href={`/admin/content?collection=${collection}`}><ArrowLeft size={14} /> Kembali ke daftar</Link>
    <div className="admin-page-head"><div><h1>Tambah {cmsCollectionLabels[collection]}</h1><p>Ini adalah konten baru. Isi formulir, periksa preview, lalu simpan sebagai draft atau terbitkan.</p></div></div>
    <CmsEntryEditor collection={collection} mode="create" />
  </>;
}
