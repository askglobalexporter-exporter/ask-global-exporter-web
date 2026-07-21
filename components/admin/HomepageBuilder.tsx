"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, GripVertical, LoaderCircle, Pencil, Save } from "lucide-react";
import { saveHomepageSectionsAction } from "@/app/admin/actions";
import { homepageSectionGuidance } from "@/lib/homepage-sections";
import { useAdminToast } from "./AdminToast";

type Content = { title?:string;eyebrow?:string;summary?:string;body?:string;cta_label?:string;cta_url?:string;image_url?:string };
type Section = { id:string;section_key:string;label:string;section_type:string;position:number;is_visible:boolean;content?:Content };

export function HomepageBuilder({ initialSections }: { initialSections: Section[] }) {
  const [sections, setSections] = useState(initialSections);
  const [dragged, setDragged] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const { notify } = useAdminToast();

  function move(from: number, to: number) {
    if (to < 0 || to >= sections.length) return;
    const next = [...sections];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setSections(next);
    setSaved(false);
  }

  function toggle(index: number) {
    setSections((current) => current.map((item, i) => i === index ? { ...item, is_visible: !item.is_visible } : item));
    setSaved(false);
  }

  function save() {
    const form = new FormData();
    form.set("sections", JSON.stringify(sections.map((item, position) => ({ id:item.id,position,is_visible:item.is_visible }))));
    startTransition(async () => { try { await saveHomepageSectionsAction(form); setSaved(true); notify("success", "Susunan homepage berhasil disimpan."); } catch (error) { notify("error", error instanceof Error ? error.message : "Susunan homepage gagal disimpan."); } });
  }

  return <>
    <div className="admin-section-list">{sections.map((section, index) => {
      const guidance = homepageSectionGuidance[section.section_key];
      const href = section.section_key === "hero" ? "/admin/sections/hero" : `/admin/sections/${section.section_key}`;
      return <article key={section.id} className={`admin-section-row ${dragged === index ? "is-dragging" : ""}`} draggable onDragStart={() => setDragged(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (dragged !== null) move(dragged, index); setDragged(null); }} onDragEnd={() => setDragged(null)}>
        <GripVertical className="admin-drag-handle" size={19} />
        <span className="admin-section-number">{String(index + 1).padStart(2,"0")}</span>
        <div><b>{guidance?.name || section.label}</b><p>{guidance?.description || "Bagian halaman publik"}</p></div>
        <span className={`admin-badge ${section.is_visible ? "published" : "draft"}`}>{section.is_visible ? "Tampil" : "Disembunyikan"}</span>
        <div className="admin-section-actions"><button type="button" onClick={() => move(index,index-1)} disabled={index===0} aria-label={`Naikkan ${section.label}`}><ArrowUp size={13}/></button><button type="button" onClick={() => move(index,index+1)} disabled={index===sections.length-1} aria-label={`Turunkan ${section.label}`}><ArrowDown size={13}/></button><label className="admin-toggle" title={section.is_visible ? "Sembunyikan" : "Tampilkan"}><input type="checkbox" checked={section.is_visible} onChange={() => toggle(index)} /><span /></label><Link className="admin-secondary-button" href={href}><Pencil size={13}/> Edit</Link></div>
      </article>;
    })}</div>
    <div className="admin-form-actions admin-section-save">{saved && <span className="admin-toast">Susunan berhasil disimpan</span>}<button type="button" className="admin-primary-button" onClick={save} disabled={pending}>{pending ? <LoaderCircle className="admin-spin" size={15}/> : <Save size={15}/>} {pending ? "Menyimpan…" : "Simpan urutan & tampilan"}</button></div>
  </>;
}
