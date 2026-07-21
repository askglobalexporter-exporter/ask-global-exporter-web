import { FolderPlus } from "lucide-react";
import Link from "next/link";
import { createMediaFolderAction } from "@/app/admin/actions";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { MediaAssetGrid, type MediaAsset } from "@/components/admin/MediaAssetGrid";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata = { title:"Media Library" };
const PAGE_SIZE = 24;

export default async function MediaPage({ searchParams }: { searchParams:Promise<{page?:string;folder?:string}> }) {
  const { supabase } = await requireAdmin("media.read");
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  let assetsQuery = supabase.from("media_assets").select("id,filename,storage_path,public_url,mime_type,size_bytes,width,height,alt_text,created_at,provider,provider_file_id", { count:"exact" }).order("created_at", { ascending:false }).range(from, from + PAGE_SIZE - 1);
  if (params.folder) assetsQuery = assetsQuery.eq("folder_id", params.folder);
  const [{ data:folders }, { data:assets, count }] = await Promise.all([
    supabase.from("media_folders").select("id,name").order("name").limit(100),
    assetsQuery,
  ]);
  const pageCount = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  return <>
    <div className="admin-page-head"><div><h1>Media Library</h1><p>Thumbnail ringan dimuat 24 per halaman; file asli tetap tersimpan di ImageKit.</p></div><form action={createMediaFolderAction} className="admin-inline-form"><input name="name" placeholder="Folder baru" required/><button><FolderPlus size={14}/> Buat folder</button></form></div>
    <article className="admin-card"><MediaUploader folders={folders ?? []}/></article>
    <nav className="admin-tabs" style={{marginTop:18}}><Link className={!params.folder ? "active" : ""} href="/admin/media">Semua</Link>{(folders ?? []).map((folder)=><Link className={params.folder === folder.id ? "active" : ""} key={folder.id} href={`/admin/media?folder=${folder.id}`}>{folder.name}</Link>)}</nav>
    <MediaAssetGrid assets={(assets ?? []) as MediaAsset[]} queryKey={`${params.folder ?? "all"}:${page}`}/>
    <AdminPagination basePath="/admin/media" page={page} pageCount={pageCount} params={{folder:params.folder ?? ""}}/>
  </>;
}
