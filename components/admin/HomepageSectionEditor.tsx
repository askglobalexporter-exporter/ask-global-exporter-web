import Link from "next/link";
import { Save } from "lucide-react";
import { saveHomepageSectionContentAction } from "@/app/admin/actions";
import { AdminLivePreview } from "./AdminLivePreview";
import { SubmitButton } from "./SubmitButton";
import { homepageSectionGuidance, resolvedHomepageContent, type HomepageEditableContent } from "@/lib/homepage-sections";

const fieldLabels: Record<keyof HomepageEditableContent, { label:string; type:"input"|"textarea" }> = {
  eyebrow: { label:"Label kecil", type:"input" },
  title: { label:"Judul utama", type:"input" },
  summary: { label:"Teks penjelasan", type:"textarea" },
  body: { label:"Isi tambahan", type:"textarea" },
  cta_label: { label:"Teks tombol", type:"input" },
  cta_url: { label:"Tujuan tombol", type:"input" },
  image_url: { label:"Foto", type:"input" },
};

export function HomepageSectionEditor({ section }: { section:{id:string;section_key:string;content?:HomepageEditableContent} }) {
  const guidance = homepageSectionGuidance[section.section_key];
  const content = resolvedHomepageContent(section.section_key, section.content);
  return <form action={saveHomepageSectionContentAction} className="admin-form admin-editor-with-preview">
    <article className="admin-card admin-editor-fields">
      <input type="hidden" name="id" value={section.id}/><input type="hidden" name="section_key" value={section.section_key}/><input type="hidden" name="redirect_to" value={`/admin/sections/${section.section_key}?saved=1`}/>
      <div className="admin-card-head"><div><h2>Konten yang sedang tayang</h2><p>Nilai saat ini sudah terisi. Ubah hanya teks yang ingin dikoreksi.</p></div></div>
      <div className="admin-form-grid">{guidance.fields.map((name)=>{
        const field = fieldLabels[name];
        return <label key={name} className={field.type === "textarea" ? "admin-field-full" : ""}><span>{field.label}</span>{field.type === "textarea" ? <textarea name={name} rows={5} defaultValue={content[name] ?? ""}/> : <input name={name} defaultValue={content[name] ?? ""}/>}</label>;
      })}</div>
      {guidance.relatedHref && <div className="admin-related-content"><div><b>Isi berulang dikelola terpisah</b><p>{guidance.relatedLabel} tanpa mengubah susunan section ini.</p></div><Link className="admin-secondary-button" href={guidance.relatedHref}>{guidance.relatedLabel}</Link></div>}
      <div className="admin-form-actions"><SubmitButton pendingLabel="Menyimpan…"><Save size={14}/> Simpan perubahan section</SubmitButton></div>
    </article>
    <aside className="admin-card admin-editor-preview"><AdminLivePreview kind="homepage" label="Preview seperti halaman publik"/></aside>
  </form>;
}
