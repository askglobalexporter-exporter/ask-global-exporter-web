"use client";

import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image as ImageIcon, LoaderCircle, Trash2 } from "lucide-react";
import { deleteMediaAssetMutation } from "@/app/admin/actions";
import { imageThumbnailUrl } from "@/lib/admin/media";

export type MediaAsset = { id:string;filename:string;storage_path:string;public_url:string;mime_type:string;size_bytes:number;width:number|null;height:number|null;alt_text:string|null;created_at:string;provider:string;provider_file_id:string|null };

export function MediaAssetGrid({ assets, queryKey }: { assets:MediaAsset[];queryKey:string }) {
  const client = useQueryClient();
  const { data = assets } = useQuery({ queryKey:["admin-media-page", queryKey], queryFn:async()=>assets, initialData:assets, staleTime:Infinity });
  const deletion = useMutation({
    mutationFn:deleteMediaAssetMutation,
    onMutate:async (variables) => {
      await client.cancelQueries({ queryKey:["admin-media-page", queryKey] });
      const previous = client.getQueryData<MediaAsset[]>(["admin-media-page", queryKey]) ?? [];
      client.setQueryData<MediaAsset[]>(["admin-media-page", queryKey], (current=[])=>current.filter((asset)=>asset.id !== variables.id));
      return { previous };
    },
    onError:(_error, _variables, context)=>client.setQueryData(["admin-media-page", queryKey], context?.previous ?? assets),
  });

  if (!data.length) return <div className="admin-card admin-empty" style={{ marginTop:18 }}><ImageIcon/><h3>Media tidak ditemukan</h3><p>Upload gambar baru atau pilih folder lain.</p></div>;
  return <div className="admin-media-grid">{data.map((asset)=><article className="admin-media-card" key={asset.id}>
    <div className="admin-media-image">{asset.mime_type.startsWith("image/") ? <Image src={imageThumbnailUrl(asset.public_url, 480, 360)} alt={asset.alt_text || asset.filename} fill sizes="(max-width: 560px) 50vw, (max-width: 1100px) 25vw, 220px" loading="lazy"/> : <div className="admin-empty"><ImageIcon/></div>}</div>
    <div className="admin-media-info"><b title={asset.filename}>{asset.filename}</b><small>{Math.round(asset.size_bytes / 1024)} KB{asset.width ? ` · ${asset.width}×${asset.height}` : ""}</small><button type="button" disabled={deletion.isPending && deletion.variables.id === asset.id} onClick={()=>deletion.mutate({ id:asset.id,storagePath:asset.storage_path,provider:asset.provider,providerFileId:asset.provider_file_id ?? "" })}>{deletion.isPending && deletion.variables.id === asset.id ? <LoaderCircle className="admin-spin" size={11}/> : <Trash2 size={11}/>} Hapus</button></div>
  </article>)}</div>;
}
