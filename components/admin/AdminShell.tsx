"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Boxes, Building2, ChevronDown, FileText, Globe2, Home, Image as ImageIcon,
  LayoutDashboard, LogOut, Menu, MessageSquareText, Search, Settings, ShieldCheck,
  Users, X,
} from "lucide-react";
import { signOutAction } from "@/app/admin/actions";
import { roleCan, roleLabel, type AdminPermission, type AdminProfile } from "@/lib/admin/types";

const navigation = [
  { href: "/admin", label: "Ringkasan", icon: LayoutDashboard, permission: "dashboard.read" },
  { href: "/admin/inquiries", label: "Permintaan buyer", icon: MessageSquareText, permission: "inquiries.read" },
  { href: "/admin/products", label: "Produk", icon: Boxes, permission: "products.read" },
  { href: "/admin/content", label: "Konten", icon: FileText, permission: "content.read" },
  { href: "/admin/sections", label: "Section website", icon: Home, permission: "homepage.write" },
  { href: "/admin/company", label: "Identitas perusahaan", icon: Building2, permission: "homepage.write" },
  { href: "/admin/media", label: "Koleksi media", icon: ImageIcon, permission: "media.read" },
  { href: "/admin/seo", label: "Pengaturan SEO", icon: Globe2, permission: "seo.write" },
  { href: "/admin/team", label: "Tim & akses", icon: Users, permission: "team.write" },
] satisfies Array<{ href: string; label: string; icon: typeof LayoutDashboard; permission: AdminPermission }>;

export function AdminShell({ profile, email, children }: { profile: AdminProfile; email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const authorizedNavigation = useMemo(
    () => navigation.filter((item) => roleCan(profile.role, item.permission)),
    [profile.role],
  );
  const searchResults = search.trim()
    ? authorizedNavigation.filter((item) => item.label.toLowerCase().includes(search.trim().toLowerCase()))
    : [];

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if ((event.key === "/" && !event.ctrlKey && !event.metaKey) || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k")) {
        const target = event.target as HTMLElement;
        if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  return (
    <div className="admin-root">
      <aside className={`admin-sidebar ${open ? "is-open" : ""}`}>
        <div className="admin-sidebar-logo"><span className="admin-logo-mark">A</span><div><b>ASK GLOBAL</b><small>Panel Admin</small></div><button onClick={() => setOpen(false)} aria-label="Tutup menu"><X size={19} /></button></div>
        <nav className="admin-nav" aria-label="Admin navigation">
          <p>Menu utama</p>
          {authorizedNavigation.map(({ href, label, icon: Icon }) => {
            const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
            return <Link key={href} href={href} className={active ? "active" : ""} onClick={() => setOpen(false)}><Icon size={18} /><span>{label}</span>{label === "Permintaan buyer" && <i>Baru</i>}</Link>;
          })}
        </nav>
        <div className="admin-sidebar-foot">
          <div className="admin-security-note"><ShieldCheck size={17} /><span><b>Panel terlindungi</b><small>Keamanan data aktif</small></span></div>
          <Link href="/" target="_blank"><Globe2 size={16} />Lihat website</Link>
        </div>
      </aside>
      {open && <button className="admin-sidebar-scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}
      <div className="admin-main">
        <header className="admin-topbar">
          <button className="admin-menu-trigger" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
          <div className="admin-search"><Search size={17} /><input ref={searchRef} aria-label="Cari menu admin" placeholder="Cari menu…" value={search} onChange={(event) => setSearch(event.target.value)} />{searchResults.length > 0 && <div className="admin-search-results">{searchResults.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setSearch("")}><Icon size={16} />{label}</Link>)}</div>}<kbd>/</kbd></div>
          <div className="admin-topbar-actions">
            <div className="admin-environment"><span />Aktif</div>
            <details className="admin-account-menu"><summary><span>{profile.full_name.slice(0, 1).toUpperCase()}</span><div><b>{profile.full_name}</b><small>{roleLabel(profile.role)}</small></div><ChevronDown size={15} /></summary><div><p>{email}</p>{roleCan(profile.role, "team.write") && <Link href="/admin/team"><Settings size={15} />Account & team</Link>}<form action={signOutAction}><button><LogOut size={15} />Sign out</button></form></div></details>
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
