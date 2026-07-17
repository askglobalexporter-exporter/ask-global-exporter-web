import { Save } from "lucide-react";
import { saveHeroSlideAction } from "@/app/admin/actions";
import { AdminLivePreview } from "./AdminLivePreview";
import { ImageUploadField } from "./ImageUploadField";
import { SubmitButton } from "./SubmitButton";
import type { HomepageHeroSlide } from "@/lib/public-content";

export function HeroSlideEditor({ slide }: { slide?:HomepageHeroSlide }) {
  return <form action={saveHeroSlideAction} className="admin-form admin-editor-with-preview">
    <article className="admin-card admin-editor-fields">
      <input type="hidden" name="id" value={slide?.id ?? ""}/><input type="hidden" name="section_key" value="hero"/>
      <div className="admin-card-head"><div><h2>{slide ? "Edit slide" : "Tambah slide baru"}</h2><p>Isi teks dan foto seperti yang akan dilihat pengunjung.</p></div></div>
      <div className="admin-form-grid">
        <label><span>Label kecil</span><input name="eyebrow" defaultValue={slide?.eyebrow ?? "Premium Indonesian vanilla"}/></label>
        <label><span>Urutan slide</span><input name="position" type="number" min="0" defaultValue={slide?.position ?? 0}/></label>
        <label className="admin-field-full"><span>Judul utama</span><input name="title" defaultValue={slide?.title ?? ""} required/></label>
        <label className="admin-field-full"><span>Teks penjelasan</span><textarea name="summary" rows={5} defaultValue={slide?.summary ?? ""}/></label>
        <ImageUploadField name="image_url" label="Foto latar hero" defaultValue={slide?.image_url ?? ""} folder="homepage/hero" help="Gunakan foto horizontal berkualitas tinggi."/>
        <label><span>Teks tombol</span><input name="cta_label" defaultValue={slide?.cta_label ?? "Request quotation"}/></label>
        <label><span>Tujuan tombol</span><input name="cta_url" defaultValue={slide?.cta_url ?? "/products/vanilla-beans#quotation"}/></label>
        <label className="admin-check admin-field-full"><input name="is_visible" type="checkbox" defaultChecked={slide?.is_visible ?? true}/><span>Tampilkan slide ini di website</span></label>
      </div>
      <div className="admin-form-actions"><SubmitButton pendingLabel="Menyimpan…"><Save size={14}/> {slide ? "Simpan perubahan" : "Simpan slide baru"}</SubmitButton></div>
    </article>
    <aside className="admin-card admin-editor-preview"><AdminLivePreview kind="homepage" label="Live preview hero"/></aside>
  </form>;
}
