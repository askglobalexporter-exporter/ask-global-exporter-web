"use client";

import { ChangeEvent, useState, useTransition } from "react";
import { ImageUp, LoaderCircle } from "lucide-react";
import { upload as uploadToImageKit } from "@imagekit/next";
import { registerMediaAssetsAction } from "@/app/admin/actions";

async function compressToWebP(file: File) {
  if (!file.type.startsWith("image/") || file.type === "image/gif") {
    return { blob: file, width: undefined, height: undefined, filename: file.name };
  }

  const bitmap = await createImageBitmap(file);
  const max = 2200;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Image processing is unavailable.");
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (value) => value ? resolve(value) : reject(new Error("Could not convert image.")),
      "image/webp",
      0.84,
    ),
  );
  return { blob, width, height, filename: file.name.replace(/\.[^.]+$/, "") + ".webp" };
}

type UploadAuth = {
  token: string;
  signature: string;
  expire: number;
  publicKey: string;
  error?: string;
};

function safeFolderName(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, "-").replace(/(^-|-$)/g, "");
}

export function MediaUploader({ folders }: { folders: Array<{ id: string; name: string }> }) {
  const [folder, setFolder] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;
    setMessage("");
    startTransition(async () => {
      try {
        const selectedFolder = folders.find((item) => item.id === folder);
        const convertedFiles = await Promise.all(files.map(compressToWebP));
        for (const converted of convertedFiles) {
          if (converted.blob.size > 10 * 1024 * 1024) {
            throw new Error(`${converted.filename} is larger than 10 MB.`);
          }
        }
        const authResponse = await fetch("/api/admin/imagekit-auth", { cache: "no-store" });
        const auth = await authResponse.json() as UploadAuth;
        if (!authResponse.ok) throw new Error(auth.error || "ImageKit upload is not configured.");
        const uploads = await Promise.all(convertedFiles.map(async (converted) => {
          const safe = converted.filename.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
          const result = await uploadToImageKit({
            file: converted.blob,
            fileName: safe,
            folder: `/ask-global/${selectedFolder ? safeFolderName(selectedFolder.name) : "library"}`,
            token: auth.token,
            expire: auth.expire,
            signature: auth.signature,
            publicKey: auth.publicKey,
            useUniqueFileName: true,
            checks: '"file.size" <= "10MB"',
          });

          if (!result.fileId || !result.filePath || !result.url) {
            throw new Error("ImageKit did not return complete file details.");
          }
          return {
            folder_id: folder || null,
            filename: result.name || converted.filename,
            storage_path: result.filePath,
            public_url: result.url,
            mime_type: converted.blob.type,
            size_bytes: result.size ?? converted.blob.size,
            width: result.width ?? converted.width,
            height: result.height ?? converted.height,
            provider: "imagekit",
            provider_file_id: result.fileId,
          } as const;
        }));
        await registerMediaAssetsAction(uploads);
        setMessage(`${files.length} file${files.length > 1 ? "s" : ""} uploaded to ImageKit and optimized.`);
        input.value = "";
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Upload failed.");
      }
    });
  }

  return <div className="admin-dropzone">
    <label>
      <input type="file" accept="image/*,application/pdf" multiple onChange={upload} disabled={pending} />
      {pending ? <LoaderCircle className="admin-spin" size={28} /> : <ImageUp size={28} />}
      <b>{pending ? "Optimizing and uploading…" : "Drop images here or click to upload"}</b>
      <small>Stored in ImageKit · Images are converted to WebP · Maximum 10 MB</small>
    </label>
    <select aria-label="Destination folder" value={folder} onChange={(event) => setFolder(event.target.value)} style={{ marginTop: 15, border: "1px solid #dce1df", borderRadius: 7, padding: 8, fontSize: 10 }}>
      <option value="">Root folder</option>
      {folders.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
    </select>
    {message && <p className="admin-toast" style={{ marginTop: 12 }}>{message}</p>}
  </div>;
}
