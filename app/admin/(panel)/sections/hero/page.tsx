import Image from "next/image";
import Link from "next/link";
import { Eye, Pencil, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import type { HomepageHeroSlide } from "@/lib/public-content";

export const metadata = { title: "Hero Slideshow" };

export default async function HeroSlidesPage() {
  const { supabase } = await requireAdmin("homepage.write");
  const { data } = await supabase.from("homepage_hero_slides").select("id,eyebrow,title,summary,image_url,cta_label,cta_url,position,is_visible").order("position");
  const slides = (data ?? []) as HomepageHeroSlide[];
  const preview = slides.find((slide)=>slide.is_visible) ?? slides[0];
  return <>
    <div className="admin-page-head"><div><h1>Hero slideshow</h1><p>Kelola beberapa banner utama. Slide aktif akan berganti otomatis pada website.</p></div><div className="admin-page-actions"><span className="admin-badge published">{slides.filter((slide)=>slide.is_visible).length} dari {slides.length} aktif</span><Link className="admin-primary-button" href="/admin/sections/hero/new"><Plus size={14}/> Tambah slide</Link></div></div>
    <div className="admin-hero-manager"><section className="admin-hero-slide-list"><div className="admin-card-head"><div><h2>Daftar slide</h2><p>Urutan mengikuti angka posisi.</p></div></div>{slides.length ? slides.map((slide,index)=><article className="admin-hero-slide-row" key={slide.id}><Image src={slide.image_url} alt="" width={82} height={58} unoptimized/><span className="admin-section-number">{String(index+1).padStart(2,"0")}</span><div><b>{slide.title}</b><p>{slide.eyebrow}</p></div><span className={`admin-badge ${slide.is_visible ? "published" : "draft"}`}>{slide.is_visible ? "Aktif" : "Nonaktif"}</span><Link className="admin-secondary-button" href={`/admin/sections/hero/${slide.id}/edit`}><Pencil size={13}/> Edit</Link></article>) : <div className="admin-card admin-empty"><h3>Belum ada slide</h3><p>Klik Tambah slide untuk membuat banner pertama.</p></div>}</section>
      <aside className="admin-card admin-hero-static-preview"><div className="admin-card-head"><div><h2><Eye size={14}/> Preview slide aktif</h2><p>Contoh tampilan pada bagian atas website.</p></div></div>{preview ? <div className="admin-public-hero-preview" style={{backgroundImage:`linear-gradient(90deg,rgba(6,27,19,.92),rgba(6,27,19,.18)),url("${preview.image_url}")`}}><small>{preview.eyebrow}</small><h2>{preview.title}</h2><p>{preview.summary}</p><span>{preview.cta_label}</span></div> : <div className="admin-empty">Belum ada preview</div>}</aside>
    </div>
  </>;
}
