import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { HomepageSectionEditor } from "@/components/admin/HomepageSectionEditor";
import { requireAdmin } from "@/lib/admin/auth";
import { homepageSectionGuidance } from "@/lib/homepage-sections";

export default async function EditWebsiteSectionPage({ params, searchParams }: { params:Promise<{key:string}>;searchParams:Promise<{saved?:string}> }) {
  const { supabase } = await requireAdmin("homepage.write");
  const { key } = await params;
  if (key === "hero") redirect("/admin/sections/hero");
  const guidance = homepageSectionGuidance[key];
  if (!guidance) notFound();
  const query = await searchParams;
  const { data } = await supabase.from("homepage_sections").select("id,section_key,content").eq("section_key", key).maybeSingle();
  if (!data) notFound();
  return <>
    <Link className="admin-back-link" href="/admin/sections"><ArrowLeft size={14}/> Kembali ke daftar section</Link>
    <div className="admin-page-head"><div><h1>Edit section: {guidance.name}</h1><p>{guidance.description} Preview di samping mengikuti susunan visual halaman publik.</p></div><div className="admin-page-actions">{query.saved && <span className="admin-toast">Perubahan berhasil disimpan</span>}<Link className="admin-secondary-button" href="/" target="_blank">Lihat website <ExternalLink size={14}/></Link></div></div>
    <HomepageSectionEditor section={data}/>
  </>;
}
