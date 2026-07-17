"use client";

import Image from "next/image";
import { Eye, Mail, MapPin, MessageCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type PreviewData = Record<string, string>;
type PreviewKind = "product" | "content" | "homepage" | "seo" | "company";

function validImage(value?: string) {
  return Boolean(value && (value.startsWith("/") || /^https?:\/\//i.test(value)));
}

export function AdminLivePreview({ kind, label = "Preview langsung" }: { kind: PreviewKind; label?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<PreviewData>({});

  useEffect(() => {
    const form = root.current?.closest("form");
    if (!form) return;
    const update = () => {
      const values: PreviewData = {};
      new FormData(form).forEach((value, key) => {
        if (typeof value === "string") values[key] = value;
      });
      setData(values);
    };
    const delayedUpdate = () => window.setTimeout(update, 0);
    form.addEventListener("input", update);
    form.addEventListener("change", update);
    window.addEventListener("admin-preview-refresh", delayedUpdate);
    update();
    return () => {
      form.removeEventListener("input", update);
      form.removeEventListener("change", update);
      window.removeEventListener("admin-preview-refresh", delayedUpdate);
    };
  }, []);

  const image = data.primary_image_url || data.featured_image_url || data.image_url || data.og_image_url || data.logo_url;
  const title = data.name || data.title || data.meta_title || data.brand_name || "Judul akan tampil di sini";
  const summary = data.short_description || data.excerpt || data.summary || data.meta_description || data.description || "Ringkasan konten akan tampil di area ini.";

  return <div className={`admin-live-preview admin-live-preview-${kind}`} ref={root}>
    <div className="admin-live-preview-head"><span><Eye size={15} /> {label}</span><small>Berubah otomatis saat Anda mengetik</small></div>
    {kind === "seo" ? <div className="admin-seo-preview">
      <div className="admin-google-preview"><small>www.askglobalexport.com{data.route || "/"}</small><h3>{title}</h3><p>{summary}</p></div>
      <div className="admin-social-preview">{validImage(image) && <Image src={image} alt="Preview Open Graph" fill sizes="420px" unoptimized />}<div><small>{data.route || "/"}</small><b>{title}</b><p>{summary}</p></div></div>
    </div> : kind === "company" ? <div className="admin-company-preview">
      <div className="admin-company-preview-brand">{validImage(image) ? <Image src={image} alt={title} width={145} height={54} unoptimized /> : <strong>{title}</strong>}<p>{data.tagline || "Tagline perusahaan"}</p></div>
      <p>{summary}</p>
      <div className="admin-company-preview-contacts"><span><MessageCircle size={15}/>{data.whatsapp_display || "+62…"}</span><span><Mail size={15}/>{data.email || "email@perusahaan.com"}</span><span><MapPin size={15}/>{data.address || "Alamat perusahaan"}</span></div>
    </div> : <div className="admin-content-preview-card">
      {validImage(image) && <div className="admin-content-preview-image"><Image src={image} alt={title} fill sizes="480px" unoptimized /></div>}
      <div><small>{kind === "product" ? (data.category || "Kategori produk") : kind === "homepage" ? (data.eyebrow || "Label bagian") : (data.collection || "Konten")}</small><h3>{title}</h3><p>{summary}</p>{data.cta_label && <span className="admin-preview-cta">{data.cta_label}</span>}</div>
    </div>}
  </div>;
}
