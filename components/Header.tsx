"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  ["About", "/#about"],
  ["Products", "/#products"],
  ["Why Alya", "/#why-us"],
  ["Process", "/#process"],
  ["Contact", "/#contact"],
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="Alya Global Trade home">
        <span className="brand-mark">A</span>
        <span>ALYA <b>GLOBAL TRADE</b></span>
      </Link>
      <nav className="desktop-nav" aria-label="Main navigation">
        {links.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}
      </nav>
      <Link href="/products/vanilla-beans#quotation" className="header-cta">Request quotation <span>↗</span></Link>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open}>
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>
      {open && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {links.map(([label, href]) => <Link key={label} href={href} onClick={() => setOpen(false)}>{label}<span>↗</span></Link>)}
        </nav>
      )}
    </header>
  );
}
