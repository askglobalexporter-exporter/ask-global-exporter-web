import { ChevronRight, Folder, FolderPlus, House } from "lucide-react";
import Link from "next/link";
import { createMediaFolderAction } from "@/app/admin/actions";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { MediaAssetGrid, type MediaAsset } from "@/components/admin/MediaAssetGrid";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata = { title:"Koleksi Media" };
const PAGE_SIZE = 24;
type MediaFolder = { id:string;name:string;parent_id:string|null };

function folderTrail(folders: MediaFolder[], currentId?: string) {
  const trail:MediaFolder[] = [];
  let current = folders.find((folder)=>folder.id === currentId);
  const visited = new Set<string>();
  while (current && !visited.has(current.id)) { visited.add(current.id); trail.unshift(current); current = folders.find((folder)=>folder.id === current?.parent_id); }
  return trail;
}

function folderPath(folders: MediaFolder[], folder: MediaFolder) {
  return folderTrail(folders, folder.id).map((item)=>item.name).join(" / ");
}

export default async function MediaPage({ searchParams }: { searchParams:Promise<{page?:string;folder?:string;view?:string}> }) {
  const { supabase } = await requireAdmin("media.read");
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const [{ data:folderData }, { data:assetData, count }] = await Promise.all([
    supabase.from("media_folders").select("id,name,parent_id").order("name").limit(250),
    (() => {
      let query = supabase.from("media_assets").select("id,filename,storage_path,public_url,mime_type,size_bytes,width,height,alt_text,created_at,provider,provider_file_id", { count:"exact" }).order("created_at", { ascending:false }).range(from, from + PAGE_SIZE - 1);
      if (params.folder) query = query.eq("folder_id", params.folder);
      else if (params.view !== "all") query = query.is("folder_id", null);
      return query;
    })(),
  ]);
  const folders = (folderData ?? []) as MediaFolder[];
  const currentFolder = folders.find((folder)=>folder.id === params.folder);
  const children = folders.filter((folder)=>folder.parent_id === (currentFolder?.id ?? null));
  const trail = folderTrail(folders, currentFolder?.id);
  const pageCount = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return <>
    <div className="admin-page-head"><div><h1>Koleksi Media</h1><p>Folder disusun seperti File Explorer. Buka folder untuk melihat dan mengunggah file di dalamnya.</p></div><form action={createMediaFolderAction} className="admin-inline-form"><input type="hidden" name="parent_id" value={currentFolder?.id ?? ""}/><input name="name" placeholder={currentFolder ? `Folder baru di ${currentFolder.name}` : "Nama folder baru"} required/><button><FolderPlus size={14}/> Buat folder</button></form></div>
    <nav className="admin-media-breadcrumb" aria-label="Lokasi folder"><Link href="/admin/media"><House size={14}/> Media</Link>{trail.map((folder)=><span key={folder.id}><ChevronRight size={13}/><Link href={`/admin/media?folder=${folder.id}`}>{folder.name}</Link></span>)}{params.view === "all" && <span><ChevronRight size={13}/>Semua file</span>}</nav>
    <article className="admin-card"><MediaUploader folders={folders.map((folder)=>({ ...folder, path:folderPath(folders, folder) }))} defaultFolder={currentFolder?.id ?? ""}/></article>
    <div className="admin-media-toolbar"><h2>{params.view === "all" ? "Semua file" : currentFolder?.name ?? "Media"}</h2><Link className={params.view === "all" ? "active" : ""} href="/admin/media?view=all">Lihat semua file</Link></div>
    {!params.view && children.length > 0 && <section className="admin-folder-grid" aria-label="Folder">{children.map((folder)=><Link href={`/admin/media?folder=${folder.id}`} key={folder.id}><span><Folder size={29} fill="currentColor"/></span><div><b>{folder.name}</b><small>Buka folder</small></div><ChevronRight size={16}/></Link>)}</section>}
    <MediaAssetGrid assets={(assetData ?? []) as MediaAsset[]} queryKey={`${params.view === "all" ? "all" : currentFolder?.id ?? "root"}:${page}`}/>
    <AdminPagination basePath="/admin/media" page={page} pageCount={pageCount} params={{folder:params.folder ?? "",view:params.view ?? ""}}/>
  </>;
}
