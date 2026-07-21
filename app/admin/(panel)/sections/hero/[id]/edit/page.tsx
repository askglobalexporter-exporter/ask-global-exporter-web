import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { deleteHeroSlideAction } from "@/app/admin/actions";
import { HeroSlideEditor } from "@/components/admin/HeroSlideEditor";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { AdminActionForm } from "@/components/admin/AdminActionForm";
import { requireAdmin } from "@/lib/admin/auth";
import type { HomepageHeroSlide } from "@/lib/public-content";

export default async function EditHeroSlidePage({ params, searchParams }: { params:Promise<{id:string}>;searchParams:Promise<{saved?:string}> }) {
  const { supabase } = await requireAdmin("homepage.write");
  const { id } = await params;
  const query = await searchParams;
  const { data } = await supabase.from("homepage_hero_slides").select("id,eyebrow,title,summary,image_url,mobile_image_url,desktop_position,mobile_position,cta_label,cta_url,position,is_visible").eq("id", id).maybeSingle();
  if (!data) notFound();
  return <><Link className="admin-back-link" href="/admin/sections/hero"><ArrowLeft size={14}/> Kembali ke daftar slide</Link><div className="admin-page-head"><div><h1>Edit slide: {data.title}</h1><p>Konten lama sudah dimuat. Ubah hanya bagian yang diperlukan.</p></div>{query.saved && <span className="admin-toast">Slide berhasil disimpan</span>}</div><HeroSlideEditor slide={data as HomepageHeroSlide}/><AdminActionForm action={deleteHeroSlideAction} successMessage="Slide berhasil dihapus." pendingMessage="Menghapus slide…" className="admin-delete-zone"><input type="hidden" name="id" value={data.id}/><div><b>Hapus slide</b><p>Slide akan dihapus permanen dari slideshow.</p></div><SubmitButton className="admin-danger-button" pendingLabel="Menghapus…"><Trash2 size={13}/> Hapus slide</SubmitButton></AdminActionForm></>;
}
