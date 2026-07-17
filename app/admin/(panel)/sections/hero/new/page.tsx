import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { HeroSlideEditor } from "@/components/admin/HeroSlideEditor";
import { requireAdmin } from "@/lib/admin/auth";

export default async function NewHeroSlidePage() {
  await requireAdmin("homepage.write");
  return <><Link className="admin-back-link" href="/admin/sections/hero"><ArrowLeft size={14}/> Kembali ke daftar slide</Link><div className="admin-page-head"><div><h1>Tambah slide hero</h1><p>Slide baru terpisah dari slide yang sudah ada sehingga tidak menimpa konten lama.</p></div></div><HeroSlideEditor/></>;
}
