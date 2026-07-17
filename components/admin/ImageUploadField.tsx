"use client";

import Image from "next/image";
import { ChangeEvent, useId, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import { upload as uploadToImageKit } from "@imagekit/next";
import { registerMediaAssetAction } from "@/app/admin/actions";

type UploadAuth = {
  token: string;
  signature: string;
  expire: number;
  publicKey: string;
  error?: string;
};

type UploadedImage = {
  url: string;
  name: string;
  fileId: string;
  filePath: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
};

async function prepareImage(file: File) {
  if (!file.type.startsWith("image/") || file.type === "image/gif") {
    throw new Error(`${file.name} is not a supported photo.`);
  }

  const bitmap = await createImageBitmap(file);
  const maxDimension = 2200;
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Image processing is unavailable in this browser.");
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (value) => value ? resolve(value) : reject(new Error("Could not optimize the photo.")),
      "image/webp",
      0.84,
    );
  });

  if (blob.size > 10 * 1024 * 1024) throw new Error(`${file.name} is larger than 10 MB after optimization.`);
  return {
    blob,
    width,
    height,
    filename: file.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9.-]+/g, "-") + ".webp",
  };
}

async function uploadImage(file: File, folder: string): Promise<UploadedImage> {
  const prepared = await prepareImage(file);
  const authResponse = await fetch("/api/admin/imagekit-auth", { cache: "no-store" });
  const auth = await authResponse.json() as UploadAuth;
  if (!authResponse.ok) throw new Error(auth.error || "Image upload is not configured.");

  const result = await uploadToImageKit({
    file: prepared.blob,
    fileName: prepared.filename,
    folder: `/ask-global/${folder}`,
    token: auth.token,
    expire: auth.expire,
    signature: auth.signature,
    publicKey: auth.publicKey,
    useUniqueFileName: true,
    checks: '"file.size" <= "10MB"',
  });

  if (!result.fileId || !result.filePath || !result.url) throw new Error("ImageKit did not return complete file details.");

  return {
    url: result.url,
    name: result.name || prepared.filename,
    fileId: result.fileId,
    filePath: result.filePath,
    mimeType: prepared.blob.type,
    size: result.size ?? prepared.blob.size,
    width: result.width ?? prepared.width,
    height: result.height ?? prepared.height,
  };
}

export function ImageUploadField({
  name,
  label,
  defaultValue,
  multiple = false,
  folder = "content",
  help,
}: {
  name: string;
  label: string;
  defaultValue?: string | string[];
  multiple?: boolean;
  folder?: string;
  help?: string;
}) {
  const inputId = useId();
  const initial = Array.isArray(defaultValue) ? defaultValue : defaultValue ? [defaultValue] : [];
  const [urls, setUrls] = useState(initial.filter(Boolean));
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function remove(index: number) {
    setUrls((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setMessage("");
  }

  function move(index: number, direction: -1 | 1) {
    setUrls((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;
    setMessage("");

    startTransition(async () => {
      try {
        const uploaded: string[] = [];
        for (const file of files) {
          const image = await uploadImage(file, folder);
          await registerMediaAssetAction({
            folder_id: null,
            filename: image.name,
            storage_path: image.filePath,
            public_url: image.url,
            mime_type: image.mimeType,
            size_bytes: image.size,
            width: image.width,
            height: image.height,
            provider: "imagekit",
            provider_file_id: image.fileId,
          });
          uploaded.push(image.url);
        }
        setUrls((current) => multiple ? [...current, ...uploaded] : uploaded.slice(-1));
        setMessage(`${uploaded.length} photo${uploaded.length > 1 ? "s" : ""} uploaded and ready to save.`);
        input.value = "";
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Upload failed.");
      }
    });
  }

  const serializedValue = multiple ? urls.join("\n") : (urls[0] ?? "");

  return <div className="admin-image-upload admin-field-full">
    <input type="hidden" name={name} value={serializedValue} />
    <span className="admin-image-upload-label">{label}</span>
    {urls.length > 0 && <div className={`admin-image-preview-grid ${multiple ? "is-multiple" : ""}`}>
      {urls.map((url, index) => <div className="admin-image-preview" key={`${url}-${index}`}>
        <Image src={url} alt={`${label} preview ${index + 1}`} fill sizes="160px" unoptimized />
        <div className="admin-image-preview-actions">
          {multiple && <>
            <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move image left"><ArrowLeft size={13} /></button>
            <button type="button" onClick={() => move(index, 1)} disabled={index === urls.length - 1} aria-label="Move image right"><ArrowRight size={13} /></button>
          </>}
          <button type="button" onClick={() => remove(index)} aria-label="Remove image"><Trash2 size={13} /></button>
        </div>
      </div>)}
    </div>}
    <div className="admin-image-upload-controls">
      <label htmlFor={inputId} className="admin-secondary-button">
        {pending ? <LoaderCircle className="admin-spin" size={15} /> : <ImagePlus size={15} />}
        {pending ? "Uploading…" : multiple ? "Upload photos" : urls.length ? "Replace photo" : "Upload photo"}
      </label>
      <input id={inputId} className="admin-file-input" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple={multiple} onChange={handleUpload} disabled={pending} />
      {urls.length > 0 && <button type="button" className="admin-secondary-button" onClick={() => setUrls([])} disabled={pending}>Clear</button>}
    </div>
    <details className="admin-image-url-fallback">
      <summary>Use an existing image URL</summary>
      {multiple
        ? <textarea value={urls.join("\n")} onChange={(event) => setUrls(event.target.value.split(/\r?\n/).map((value) => value.trim()).filter(Boolean))} rows={3} placeholder="One image URL per line" />
        : <input type="url" value={urls[0] ?? ""} onChange={(event) => setUrls(event.target.value ? [event.target.value] : [])} placeholder="https://ik.imagekit.io/…" />}
    </details>
    <small>{help || "JPG, PNG, WebP, or AVIF · automatically converted to WebP · maximum 10 MB"}</small>
    {message && <p className={`admin-upload-message ${message.includes("failed") || message.includes("not ") || message.includes("larger") ? "error" : ""}`}>{message}</p>}
  </div>;
}
