"use client";

import Image from "next/image";
import { Eye, Mail, MapPin, MessageCircle, Monitor, Smartphone } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type PreviewData = Record<string, string>;
type PreviewKind = "product" | "content" | "homepage" | "seo" | "company";

function validImage(value?: string) {
  return Boolean(value && (value.startsWith("/") || /^https?:\/\//i.test(value)));
}

export function AdminLivePreview({ kind, label = "Preview langsung" }: { kind: PreviewKind; label?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<PreviewData>({});
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");

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
  const homepageImage = viewport === "mobile" ? (data.mobile_image_url || image) : image;
  const homepagePosition = viewport === "mobile" ? (data.mobile_position || "center center") : (data.desktop_position || "center right");
  const title = data.name || data.title || data.meta_title || data.brand_name || "Judul akan tampil di sini";
  const summary = data.short_description || data.excerpt || data.summary || data.body || data.meta_description || data.description || "Ringkasan konten akan tampil di area ini.";

  return <div className={`admin-live-preview admin-live-preview-${kind}`} ref={root}>
    <div className="admin-live-preview-head"><span><Eye size={15} /> {label}</span>{kind === "homepage" && data.section_key === "hero" ? <div className="admin-preview-device-switch"><button type="button" className={viewport === "desktop" ? "active" : ""} onClick={()=>setViewport("desktop")}><Monitor size={13}/> Desktop</button><button type="button" className={viewport === "mobile" ? "active" : ""} onClick={()=>setViewport("mobile")}><Smartphone size={13}/> Mobile</button></div> : <small>Berubah otomatis saat Anda mengetik</small>}</div>
    {kind === "seo" ? <div className="admin-seo-preview">
      <div className="admin-google-preview"><small>www.askglobalexport.com{data.route || "/"}</small><h3>{title}</h3><p>{summary}</p></div>
      <div className="admin-social-preview">{validImage(image) && <Image src={image} alt="Preview Open Graph" fill sizes="420px" unoptimized />}<div><small>{data.route || "/"}</small><b>{title}</b><p>{summary}</p></div></div>
    </div> : kind === "homepage" ? <div className={`admin-public-section-preview ${data.section_key === "hero" ? "is-hero" : ""} ${viewport === "mobile" ? "is-mobile" : ""}`} style={data.section_key === "hero" && validImage(homepageImage) ? {backgroundImage:`linear-gradient(90deg,rgba(4,24,16,.94),rgba(4,24,16,.2)),url("${homepageImage}")`,backgroundPosition:homepagePosition} : undefined}>
      <small>{data.eyebrow || "ASK GLOBAL"}</small><h3>{title}</h3><p>{summary}</p>{data.cta_label && <span>{data.cta_label}</span>}
    </div> : kind === "company" ? <div className="admin-company-preview">
      <div className="admin-company-preview-brand">{validImage(image) ? <Image src={image} alt={title} width={145} height={54} unoptimized /> : <strong>{title}</strong>}<p>{data.tagline || "Tagline perusahaan"}</p></div>
      <p>{summary}</p>
      <div className="admin-company-preview-contacts"><span><MessageCircle size={15}/>{data.whatsapp_display || "+62…"}</span><span><Mail size={15}/>{data.email || "email@perusahaan.com"}</span><span><MapPin size={15}/>{data.address || "Alamat perusahaan"}</span></div>
    </div> : <div className="admin-content-preview-card">
      {validImage(image) && <div className="admin-content-preview-image"><Image src={image} alt={title} fill sizes="480px" unoptimized /></div>}
      <div><small>{kind === "product" ? (data.category || "Kategori produk") : (data.collection || "Konten")}</small><h3>{title}</h3><p>{summary}</p>{data.cta_label && <span className="admin-preview-cta">{data.cta_label}</span>}</div>
    </div>}
  </div>;
}
