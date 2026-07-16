"use client";

import { ChangeEvent, useState, useTransition } from "react";
import { ImageUp, LoaderCircle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { registerMediaAssetAction } from "@/app/admin/actions";

async function compressToWebP(file: File) {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return { blob:file, width:undefined, height:undefined, filename:file.name };
  const bitmap = await createImageBitmap(file); const max = 2200; const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale); const height = Math.round(bitmap.height * scale); const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height;
  const context = canvas.getContext("2d"); if (!context) throw new Error("Image processing is unavailable."); context.drawImage(bitmap, 0, 0, width, height); bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Could not convert image.")), "image/webp", .84));
  return { blob, width, height, filename:file.name.replace(/\.[^.]+$/, "") + ".webp" };
}

export function MediaUploader({ folders }: { folders:Array<{id:string;name:string}> }) {
  const [folder, setFolder] = useState(""); const [message, setMessage] = useState(""); const [pending, startTransition] = useTransition();
  async function upload(event: ChangeEvent<HTMLInputElement>) { const files = Array.from(event.target.files ?? []); if (!files.length) return; setMessage(""); startTransition(async () => { try { const supabase = createSupabaseBrowserClient(); for (const file of files) { const converted = await compressToWebP(file); const safe = converted.filename.toLowerCase().replace(/[^a-z0-9.-]+/g,"-"); const path = `${folder || "root"}/${Date.now()}-${crypto.randomUUID().slice(0,8)}-${safe}`; const { error } = await supabase.storage.from("media").upload(path, converted.blob, { contentType:converted.blob.type, cacheControl:"31536000" }); if (error) throw error; const { data } = supabase.storage.from("media").getPublicUrl(path); await registerMediaAssetAction({ folder_id:folder || null, filename:converted.filename, storage_path:path, public_url:data.publicUrl, mime_type:converted.blob.type, size_bytes:converted.blob.size, width:converted.width, height:converted.height }); } setMessage(`${files.length} file${files.length > 1 ? "s" : ""} uploaded and optimized.`); event.target.value=""; } catch (error) { setMessage(error instanceof Error ? error.message : "Upload failed."); } }); }
  return <div className="admin-dropzone"><label><input type="file" accept="image/*,application/pdf" multiple onChange={upload} disabled={pending} />{pending ? <LoaderCircle className="admin-spin" size={28} /> : <ImageUp size={28} />}<b>{pending ? "Optimizing and uploading…" : "Drop images here or click to upload"}</b><small>Images are resized and converted to WebP · Maximum 10 MB</small></label><select aria-label="Destination folder" value={folder} onChange={(event) => setFolder(event.target.value)} style={{marginTop:15,border:"1px solid #dce1df",borderRadius:7,padding:8,fontSize:10}}><option value="">Root folder</option>{folders.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{message && <p className="admin-toast" style={{marginTop:12}}>{message}</p>}</div>;
}
