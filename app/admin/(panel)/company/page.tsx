import { Building2, Save } from "lucide-react";
import { saveCompanySettingsAction } from "@/app/admin/actions";
import { AdminLivePreview } from "@/components/admin/AdminLivePreview";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { requireAdmin } from "@/lib/admin/auth";
import { defaultCompanySettings, type CompanySettings } from "@/lib/public-content";

export const metadata = { title: "Identitas Perusahaan" };

export default async function CompanySettingsPage() {
  const { supabase } = await requireAdmin("homepage.write");
  const { data } = await supabase.from("company_settings").select("*").eq("singleton", true).maybeSingle();
  const settings: CompanySettings = { ...defaultCompanySettings, ...(data as Partial<CompanySettings> | null) };

  return <>
    <div className="admin-page-head"><div><h1>Identitas perusahaan</h1><p>Kelola informasi utama yang tampil di header, kontak, footer, WhatsApp, dan metadata website.</p></div></div>
    <form action={saveCompanySettingsAction} className="admin-form admin-editor-with-preview">
      <article className="admin-card">
        <div className="admin-card-head"><div><h2><Building2 size={15}/> Informasi utama</h2><p>Isi dengan data resmi yang boleh dilihat calon pembeli.</p></div></div>
        <div className="admin-form-grid">
          <label><span>Nama brand</span><input name="brand_name" defaultValue={settings.brand_name} required /><small>Jika logo kosong, kata pertama tampil besar dan kata berikutnya menjadi subjudul.</small></label>
          <label><span>Nama legal perusahaan</span><input name="legal_name" defaultValue={settings.legal_name} required /><small>Nama untuk metadata dan dokumen resmi.</small></label>
          <label className="admin-field-full"><span>Tagline</span><input name="tagline" defaultValue={settings.tagline} /></label>
          <label className="admin-field-full"><span>Deskripsi perusahaan</span><textarea name="description" rows={4} defaultValue={settings.description} /></label>
          <label><span>Email perusahaan</span><input name="email" type="email" defaultValue={settings.email} required /></label>
          <label><span>Nomor WhatsApp untuk link</span><input name="whatsapp_number" inputMode="numeric" defaultValue={settings.whatsapp_number} required /><small>Angka saja, contoh: 6285196598995.</small></label>
          <label><span>Tampilan nomor WhatsApp</span><input name="whatsapp_display" defaultValue={settings.whatsapp_display} required /><small>Contoh: +62 851-9659-8995.</small></label>
          <label><span>Jam operasional</span><input name="business_hours" defaultValue={settings.business_hours} /></label>
          <label className="admin-field-full"><span>Alamat kantor</span><textarea name="address" rows={2} defaultValue={settings.address} /></label>
          <label className="admin-field-full"><span>Wilayah layanan</span><input name="service_area" defaultValue={settings.service_area} /></label>
          <ImageUploadField name="logo_url" label="Logo perusahaan" defaultValue={settings.logo_url ?? ""} folder="brand" help="Opsional. Jika diisi, file ini menggantikan tulisan nama brand pada header. Gunakan PNG atau WebP transparan." />
          <ImageUploadField name="whatsapp_logo_url" label="Logo WhatsApp" defaultValue={settings.whatsapp_logo_url ?? ""} folder="brand" help="Gunakan ikon persegi transparan. Jika kosong, panel memakai tanda WA bawaan." />
        </div>
        <div className="admin-form-actions"><SubmitButton pendingLabel="Menyimpan…"><Save size={14}/> Simpan identitas perusahaan</SubmitButton></div>
      </article>
      <aside><AdminLivePreview kind="company" label="Preview identitas perusahaan" /></aside>
    </form>
  </>;
}
