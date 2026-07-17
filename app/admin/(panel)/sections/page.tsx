import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { HomepageBuilder } from "@/components/admin/HomepageBuilder";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata = { title: "Section Website" };

export default async function WebsiteSectionsPage() {
  const { supabase } = await requireAdmin("homepage.write");
  const { data } = await supabase.from("homepage_sections").select("id,section_key,label,section_type,position,is_visible,content").order("position");
  return <>
    <div className="admin-page-head"><div><h1>Section website</h1><p>Setiap baris mewakili satu bagian halaman publik. Klik Edit untuk membuka editor yang sesuai.</p></div><div className="admin-page-actions"><Link className="admin-secondary-button" href="/" target="_blank">Lihat website <ExternalLink size={14}/></Link></div></div>
    <article className="admin-card"><div className="admin-card-head"><div><h2>Susunan halaman beranda</h2><p>Atur urutan dan visibilitas di sini. Isi setiap section diedit pada halaman terpisah.</p></div></div><HomepageBuilder initialSections={data ?? []}/></article>
  </>;
}
