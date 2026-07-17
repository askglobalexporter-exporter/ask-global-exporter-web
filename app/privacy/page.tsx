import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { getCompanySettings } from "@/lib/public-content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Ask Global collects, uses, protects, and retains personal information submitted through this website.",
  alternates: { canonical: "/privacy" },
  openGraph: { title: "Privacy Policy | Ask Global", description: "How Ask Global handles personal information submitted through its website." },
};

export default async function PrivacyPage() {
  const company = await getCompanySettings();
  return <main className="editorial-page legal-page">
    <div className="detail-header-wrap"><Header/></div>
    <header className="legal-hero"><div className="shell legal-shell"><div className="eyebrow"><span/> Privacy & data protection</div><h1>Privacy Policy</h1><p>Last updated: 17 July 2026</p></div></header>
    <article className="shell legal-shell legal-copy">
      <p>This Privacy Policy explains how {company.legal_name}, referred to as Ask Global, we, us, or our, handles information when you visit <Link href="/">askglobalexport.com</Link>, request a quotation, request a sample, or contact our team.</p>
      <h2>Information we collect</h2>
      <p>We may collect company and contact details, including your name, business email, phone or WhatsApp number, company name, country, company website, product requirements, requested quantity, destination, shipping address, courier account, and any notes you provide.</p>
      <p>We also collect limited technical information such as page visits, product views, approximate country, browser information, and a daily pseudonymous visitor identifier. We use spam-prevention signals to protect our forms and systems.</p>
      <h2>How we use information</h2>
      <ul><li>Review and respond to quotation and sample requests.</li><li>Communicate about product specifications, availability, pricing, shipping, and commercial terms.</li><li>Manage buyer inquiries and maintain business records.</li><li>Measure website performance and improve our content and services.</li><li>Detect spam, misuse, fraud, and security threats.</li><li>Meet legal, regulatory, accounting, or dispute-resolution obligations.</li></ul>
      <h2>Legal basis and consent</h2>
      <p>We process inquiry information with your consent and as necessary to take steps toward a potential business relationship. We may also process limited information for legitimate interests such as website security, service improvement, and maintaining business records.</p>
      <h2>Service providers and international processing</h2>
      <p>We use trusted providers to operate this website and process data on our behalf, including Vercel for hosting, Supabase for authentication and database services, ImageKit for media delivery, Cloudflare Turnstile for spam protection, and an email delivery provider for inquiry notifications. These providers may process information in countries outside your country of residence under their applicable safeguards and terms.</p>
      <h2>Sharing of information</h2>
      <p>We do not sell personal information. We may share it with service providers, advisers, logistics or sourcing partners where needed to respond to your request, or authorities when legally required. We limit sharing to information reasonably necessary for the stated purpose.</p>
      <h2>Retention and security</h2>
      <p>We retain inquiry and business records only for as long as reasonably needed to respond, manage the business relationship, comply with legal obligations, and resolve disputes. We use access controls, authenticated administration, database security policies, encrypted connections, spam controls, and restricted service credentials. No internet service can guarantee absolute security.</p>
      <h2>Your choices and rights</h2>
      <p>Subject to applicable law, you may ask to access, correct, update, or delete your personal information, object to or restrict certain processing, or withdraw consent. Withdrawing consent does not affect processing already completed lawfully.</p>
      <h2>Cookies and analytics</h2>
      <p>We use essential authentication storage for the protected admin area. Public analytics are first-party and record limited page-view information; they do not store raw IP addresses in our analytics database. Cloudflare Turnstile may use technical signals necessary to distinguish legitimate visitors from automated abuse.</p>
      <h2>Children</h2>
      <p>This website is intended for business users and is not directed to children. We do not knowingly collect personal information from children.</p>
      <h2>Updates to this policy</h2>
      <p>We may update this policy when our services, providers, or legal obligations change. The latest version and update date will always appear on this page.</p>
      <h2>Contact us</h2>
      <p>For privacy questions or requests, email <a href={`mailto:${company.email}?subject=Privacy request`}>{company.email}</a> or write to {company.legal_name}, {company.address}.</p>
      <Link className="text-link legal-back" href="/"><ArrowLeft size={15}/> Return to website</Link>
    </article>
    <footer className="legal-footer"><div className="shell legal-shell"><span>© {new Date().getFullYear()} {company.brand_name}</span><Link href="/privacy">Privacy Policy</Link></div></footer>
  </main>;
}
