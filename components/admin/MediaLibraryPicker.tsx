"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Check, Images, LoaderCircle, Search, X } from "lucide-react";

type Asset = {
  id:string;
  folder_id:string|null;
  filename:string;
  public_url:string;
  mime_type:string;
  width:number|null;
  height:number|null;
  alt_text:string|null;
  created_at:string;
};
type Folder = { id:string;name:string };

export function MediaLibraryPicker({ open, multiple, value, onChange, onClose }: {
  open:boolean;
  multiple:boolean;
  value:string[];
  onChange:(urls:string[])=>void;
  onClose:()=>void;
}) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set("q", search.trim());
        if (folder) params.set("folder", folder);
        const response = await fetch(`/api/admin/media-library?${params}`, { cache:"no-store", signal:controller.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Media Library tidak dapat dimuat.");
        setAssets(result.assets ?? []);
        setFolders(result.folders ?? []);
      } catch (requestError) {
        if ((requestError as Error).name !== "AbortError") setError(requestError instanceof Error ? requestError.message : "Media Library tidak dapat dimuat.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 200);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [open, search, folder]);

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

  return <div className="admin-media-picker-backdrop" role="presentation" onMouseDown={(event)=>{ if (event.target === event.currentTarget) onClose(); }}>
    <section className="admin-media-picker" role="dialog" aria-modal="true" aria-labelledby="media-library-title">
      <div className="admin-media-picker-head"><div><h2 id="media-library-title"><Images size={17}/> Pilih dari Media Library</h2><p>{multiple ? "Pilih satu atau beberapa foto yang sudah tersedia." : "Pilih satu foto yang sudah tersedia."}</p></div><button type="button" onClick={onClose} aria-label="Tutup Media Library"><X size={18}/></button></div>
      <div className="admin-media-picker-filters"><label><Search size={15}/><input value={search} onChange={(event)=>setSearch(event.target.value)} placeholder="Cari nama file…" autoFocus/></label><select value={folder} onChange={(event)=>setFolder(event.target.value)}><option value="">Semua folder</option>{folders.map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
      <div className="admin-media-picker-body">
        {loading ? <div className="admin-media-picker-state"><LoaderCircle className="admin-spin"/><p>Memuat Media Library…</p></div>
          : error ? <div className="admin-media-picker-state error"><p>{error}</p></div>
          : assets.length ? <div className="admin-media-picker-grid">{assets.map((asset)=>{const selected=value.includes(asset.public_url);return <button type="button" className={selected ? "is-selected" : ""} key={asset.id} onClick={()=>choose(asset)} title={asset.filename}><span><Image src={asset.public_url} alt={asset.alt_text || asset.filename} fill sizes="150px" unoptimized/></span><b>{asset.filename}</b><small>{asset.width && asset.height ? `${asset.width}×${asset.height}` : "Image"}</small>{selected && <i><Check size={13}/></i>}</button>;})}</div>
          : <div className="admin-media-picker-state"><Images/><h3>Foto tidak ditemukan</h3><p>Coba kata pencarian lain atau upload foto dari perangkat.</p></div>}
      </div>
      <div className="admin-media-picker-foot"><span>{multiple ? `${value.length} foto dipilih` : "Klik foto untuk memilih"}</span><button type="button" className="admin-primary-button" onClick={onClose}>{multiple ? "Gunakan foto terpilih" : "Selesai"}</button></div>
    </section>
  </div>;
}
