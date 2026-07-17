"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, GripVertical, LoaderCircle, Save } from "lucide-react";
import { saveHomepageSectionContentAction, saveHomepageSectionsAction } from "@/app/admin/actions";
import { SubmitButton } from "./SubmitButton";
import { ImageUploadField } from "./ImageUploadField";
import { AdminLivePreview } from "./AdminLivePreview";

type Content = { title?:string;eyebrow?:string;summary?:string;body?:string;cta_label?:string;cta_url?:string;image_url?:string };
type Section = { id:string;section_key:string;label:string;section_type:string;position:number;is_visible:boolean;content?:Content };

export function HomepageBuilder({ initialSections }: { initialSections: Section[] }) {
  const [sections, setSections] = useState(initialSections);
  const [dragged, setDragged] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

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
    startTransition(async () => { await saveHomepageSectionsAction(form); setSaved(true); });
  }

  return <>
    <div className="admin-builder-list">{sections.map((section, index) => <div key={section.id} className="admin-builder-section">
      <div className={`admin-builder-item ${dragged === index ? "is-dragging" : ""}`} draggable onDragStart={() => setDragged(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (dragged !== null) move(dragged, index); setDragged(null); }} onDragEnd={() => setDragged(null)}>
        <GripVertical className="admin-drag-handle" size={18} /><div><b>{section.label}</b><small>{section.section_type} · {section.section_key}</small></div><span className={`admin-badge ${section.is_visible ? "published" : "draft"}`}>{section.is_visible ? "Visible" : "Hidden"}</span><div className="admin-page-actions"><button type="button" className="admin-secondary-button" onClick={() => move(index,index-1)} disabled={index===0} aria-label={`Move ${section.label} up`}><ArrowUp size={13} /></button><button type="button" className="admin-secondary-button" onClick={() => move(index,index+1)} disabled={index===sections.length-1} aria-label={`Move ${section.label} down`}><ArrowDown size={13} /></button><label className="admin-toggle" title={section.is_visible ? "Hide section" : "Show section"}><input type="checkbox" checked={section.is_visible} onChange={() => toggle(index)} /><span /></label></div>
      </div>
      <details className="admin-builder-copy"><summary>Edit isi dan lihat preview</summary><form action={saveHomepageSectionContentAction} className="admin-form"><input type="hidden" name="id" value={section.id}/><input type="hidden" name="section_key" value={section.section_key}/><div className="admin-form-grid"><label><span>Label kecil</span><input name="eyebrow" defaultValue={section.content?.eyebrow ?? ""}/></label><label><span>Judul bagian</span><input name="title" defaultValue={section.content?.title ?? ""}/></label><label className="admin-field-full"><span>Ringkasan</span><textarea name="summary" rows={2} defaultValue={section.content?.summary ?? ""}/></label><label className="admin-field-full"><span>Isi tambahan</span><textarea name="body" rows={4} defaultValue={section.content?.body ?? ""}/></label><ImageUploadField name="image_url" label="Foto bagian" defaultValue={section.content?.image_url ?? ""} folder="homepage"/><label><span>Teks tombol</span><input name="cta_label" defaultValue={section.content?.cta_label ?? ""}/></label><label><span>Tujuan tombol</span><input name="cta_url" defaultValue={section.content?.cta_url ?? ""}/></label></div><AdminLivePreview kind="homepage" label={`Preview ${section.label}`}/><div className="admin-form-actions"><SubmitButton pendingLabel="Menyimpan…">Simpan isi bagian</SubmitButton></div></form></details>
    </div>)}</div>
    <div className="admin-form-actions" style={{marginTop:18}}>{saved && <span className="admin-toast">Susunan beranda tersimpan</span>}<button type="button" className="admin-primary-button" onClick={save} disabled={pending}>{pending ? <LoaderCircle className="admin-spin" size={15} /> : <Save size={15} />}{pending ? "Menyimpan…" : "Simpan susunan"}</button></div>
  </>;
}
