"use client";

import Image from "next/image";
import { useDeferredValue, useEffect, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Check, Images, LoaderCircle, Search, X } from "lucide-react";
import { imageThumbnailUrl } from "@/lib/admin/media";

type Asset = { id:string;folder_id:string|null;filename:string;public_url:string;mime_type:string;width:number|null;height:number|null;alt_text:string|null;created_at:string };
type Folder = { id:string;name:string };
type AssetPage = { assets:Asset[];nextPage:number|null;error?:string };

async function readJson<T>(url:string, signal?:AbortSignal):Promise<T> {
  const response = await fetch(url, { signal });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Media Library tidak dapat dimuat.");
  return result as T;
}

export function MediaLibraryPicker({ open, multiple, value, onChange, onClose }: {
  open:boolean;multiple:boolean;value:string[];onChange:(urls:string[])=>void;onClose:()=>void;
}) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const [folder, setFolder] = useState("");
  const foldersQuery = useQuery({
    queryKey:["media-folders"],
    queryFn:({ signal })=>readJson<{folders:Folder[]}>("/api/admin/media-library?scope=folders", signal),
    enabled:open,
    staleTime:5 * 60_000,
  });
  const assetsQuery = useInfiniteQuery({
    queryKey:["media-library", deferredSearch, folder],
    initialPageParam:1,
    enabled:open,
    queryFn:({ pageParam, signal })=>{
      const params = new URLSearchParams({ page:String(pageParam) });
      if (deferredSearch) params.set("q", deferredSearch);
      if (folder) params.set("folder", folder);
      return readJson<AssetPage>(`/api/admin/media-library?${params}`, signal);
    },
    getNextPageParam:(last)=>last.nextPage ?? undefined,
    staleTime:60_000,
  });
  const assets = assetsQuery.data?.pages.flatMap((page)=>page.assets) ?? [];
  const folders = foldersQuery.data?.folders ?? [];

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event:KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose]);

  if (!open) return null;
  function choose(asset:Asset) {
    const selected = value.includes(asset.public_url);
    if (multiple) onChange(selected ? value.filter((url)=>url !== asset.public_url) : [...value, asset.public_url]);
    else { onChange([asset.public_url]); onClose(); }
  }
  const error = assetsQuery.error ?? foldersQuery.error;

  return <div className="admin-media-picker-backdrop" role="presentation" onMouseDown={(event)=>{ if (event.target === event.currentTarget) onClose(); }}>
    <section className="admin-media-picker" role="dialog" aria-modal="true" aria-labelledby="media-library-title">
      <div className="admin-media-picker-head"><div><h2 id="media-library-title"><Images size={17}/> Pilih dari Media Library</h2><p>24 thumbnail dimuat per tahap agar koleksi besar tetap lancar.</p></div><button type="button" onClick={onClose} aria-label="Tutup Media Library"><X size={18}/></button></div>
      <div className="admin-media-picker-filters"><label><Search size={15}/><input value={search} onChange={(event)=>setSearch(event.target.value)} placeholder="Cari nama file…" autoFocus/></label><select value={folder} onChange={(event)=>setFolder(event.target.value)}><option value="">Semua folder</option>{folders.map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
      <div className="admin-media-picker-body">
        {assetsQuery.isPending ? <div className="admin-media-picker-state"><LoaderCircle className="admin-spin"/><p>Memuat Media Library…</p></div>
          : error ? <div className="admin-media-picker-state error"><p>{error.message}</p></div>
          : assets.length ? <><div className="admin-media-picker-grid">{assets.map((asset)=>{const selected=value.includes(asset.public_url);return <button type="button" className={selected ? "is-selected" : ""} key={asset.id} onClick={()=>choose(asset)} title={asset.filename}><span><Image src={imageThumbnailUrl(asset.public_url, 320, 240)} alt={asset.alt_text || asset.filename} fill sizes="(max-width: 640px) 42vw, 150px" loading="lazy"/></span><b>{asset.filename}</b><small>{asset.width && asset.height ? `${asset.width}×${asset.height}` : "Image"}</small>{selected && <i><Check size={13}/></i>}</button>;})}</div>{assetsQuery.hasNextPage && <div className="admin-media-load-more"><button type="button" className="admin-secondary-button" disabled={assetsQuery.isFetchingNextPage} onClick={()=>assetsQuery.fetchNextPage()}>{assetsQuery.isFetchingNextPage ? "Memuat…" : "Muat 24 gambar berikutnya"}</button></div>}</>
          : <div className="admin-media-picker-state"><Images/><h3>Foto tidak ditemukan</h3><p>Coba kata pencarian lain atau upload foto dari perangkat.</p></div>}
      </div>
      <div className="admin-media-picker-foot"><span>{multiple ? `${value.length} foto dipilih` : "Klik foto untuk memilih"}</span><button type="button" className="admin-primary-button" onClick={onClose}>{multiple ? "Gunakan foto terpilih" : "Selesai"}</button></div>
    </section>
  </div>;
}
