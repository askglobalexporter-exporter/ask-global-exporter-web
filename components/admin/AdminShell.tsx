"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Boxes, ChevronDown, FileText, Globe2, Home, Image as ImageIcon,
  LayoutDashboard, LogOut, Menu, MessageSquareText, Search, Settings, ShieldCheck,
  Users, X,
} from "lucide-react";
import { signOutAction } from "@/app/admin/actions";
import { roleLabel, type AdminProfile } from "@/lib/admin/types";

const navigation = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/inquiries", label: "Inquiry CRM", icon: MessageSquareText },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/homepage", label: "Homepage", icon: Home },
  { href: "/admin/media", label: "Media Library", icon: ImageIcon },
  { href: "/admin/seo", label: "SEO Manager", icon: Globe2 },
  { href: "/admin/team", label: "Team & Roles", icon: Users },
];

export function AdminShell({ profile, email, children }: { profile: AdminProfile; email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <div className="admin-root">
      <aside className={`admin-sidebar ${open ? "is-open" : ""}`}>
        <div className="admin-sidebar-logo"><span className="admin-logo-mark">A</span><div><b>ASK GLOBAL</b><small>Admin Console</small></div><button onClick={() => setOpen(false)} aria-label="Close menu"><X size={19} /></button></div>
        <nav className="admin-nav" aria-label="Admin navigation">
          <p>Workspace</p>
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
            return <Link key={href} href={href} className={active ? "active" : ""} onClick={() => setOpen(false)}><Icon size={18} /><span>{label}</span>{label === "Inquiry CRM" && <i>Live</i>}</Link>;
          })}
        </nav>
        <div className="admin-sidebar-foot">
          <div className="admin-security-note"><ShieldCheck size={17} /><span><b>Secure workspace</b><small>RLS protection active</small></span></div>
          <Link href="/" target="_blank"><Globe2 size={16} />View live website</Link>
        </div>
      </aside>
      {open && <button className="admin-sidebar-scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}
      <div className="admin-main">
        <header className="admin-topbar">
          <button className="admin-menu-trigger" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
          <div className="admin-search"><Search size={17} /><input aria-label="Search admin" placeholder="Search products, inquiries, content…" /><kbd>⌘ K</kbd></div>
          <div className="admin-topbar-actions">
            <div className="admin-environment"><span />Production</div>
            <details className="admin-account-menu"><summary><span>{profile.full_name.slice(0, 1).toUpperCase()}</span><div><b>{profile.full_name}</b><small>{roleLabel(profile.role)}</small></div><ChevronDown size={15} /></summary><div><p>{email}</p><Link href="/admin/team"><Settings size={15} />Account & team</Link><form action={signOutAction}><button><LogOut size={15} />Sign out</button></form></div></details>
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
