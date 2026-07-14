"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight, Check, Globe2, Mail, MapPin, PackageCheck, ShieldCheck, Ship, Sparkles } from "lucide-react";
import { useRef } from "react";
import { Header } from "./Header";
import { products } from "@/data/products";

const ease = [0.22, 1, 0.36, 1] as const;
const reveal = { initial: { opacity: 0, y: 28 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-80px" }, transition: { duration: .75, ease } };

export function HomePage() {
  const hero = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: hero, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.12]);

  return (
    <main>
      <section className="hero" ref={hero}>
        <motion.div className="hero-image" style={{ y: heroY, scale: heroScale }} />
        <div className="hero-shade" />
        <Header />
        <div className="hero-content shell">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .8 }} className="eyebrow"><span /> Indonesia, delivered globally</motion.div>
          <motion.h1 initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .95, delay: .1, ease }}>
            Premium Indonesian<br />Products For <em>Global Markets.</em>
          </motion.h1>
          <motion.div className="hero-bottom" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .35, ease }}>
            <p>Trusted sourcing, quality assurance, and end-to-end export solutions for discerning international buyers.</p>
            <div className="hero-actions">
              <a href="#products" className="btn btn-gold">Explore products <ArrowDown size={16} /></a>
              <a href="#contact" className="btn btn-glass">Request quotation <ArrowRight size={16} /></a>
            </div>
          </motion.div>
        </div>
        <div className="hero-stats">
          <div><strong>9+</strong><span>Product categories</span></div>
          <div><strong>15+</strong><span>Source regions</span></div>
          <div><strong>100%</strong><span>Export focused</span></div>
          <div className="hero-origin"><Globe2 size={18} /><span>Origin<br /><b>Indonesia</b></span></div>
        </div>
      </section>

      <section className="intro section shell" id="about">
        <motion.div {...reveal} className="section-label">01 / Who we are</motion.div>
        <div className="intro-grid">
          <motion.h2 {...reveal}>From the heart of Indonesia,<br /><em>to businesses worldwide.</em></motion.h2>
          <motion.div {...reveal} className="intro-copy">
            <p>ALYA Global Trade connects the richness of Indonesia with businesses around the world. We curate export-ready products from trusted producers and manage every detail from sourcing to shipment.</p>
            <a href="#why-us" className="text-link">Discover our standards <ArrowRight size={15} /></a>
          </motion.div>
        </div>
        <motion.div {...reveal} className="promise-card">
          <div className="promise-image" />
          <div className="promise-copy">
            <div className="eyebrow"><span /> Our promise</div>
            <h3>Quality without compromise.</h3>
            <p>Every partnership starts with transparency. Every product is carefully selected, inspected, and prepared to meet international expectations.</p>
            <div className="mini-values">
              <span><Check /> Traceable sourcing</span><span><Check /> Consistent quality</span><span><Check /> Clear communication</span>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="products-section section" id="products">
        <div className="shell">
          <motion.div {...reveal} className="section-label">02 / Curated products</motion.div>
          <motion.div {...reveal} className="section-heading">
            <h2>Indonesia’s finest,<br /><em>selected for the world.</em></h2>
            <p>From fertile highlands to skilled artisan communities, our portfolio celebrates Indonesia’s most distinctive products.</p>
          </motion.div>
          <div className="product-grid">
            {products.map((product, index) => (
              <motion.article {...reveal} transition={{ ...reveal.transition, delay: (index % 3) * .08 }} className="product-card" key={product.slug}>
                <Link href={`/products/${product.slug}`} className="product-image-wrap" aria-label={`View ${product.name}`}>
                  <Image src={product.image} alt={product.name} fill sizes="(max-width: 800px) 100vw, 33vw" className="product-image" />
                  <span className="product-index">0{index + 1}</span>
                  <span className="product-arrow"><ArrowRight size={18} /></span>
                </Link>
                <div className="product-meta"><span>{product.category}</span><span>{product.origin}</span></div>
                <h3><Link href={`/products/${product.slug}`}>{product.name}</Link></h3>
                <p>{product.description}</p>
                <div className="product-footer"><span>MOQ <b>{product.moq}</b></span><Link href={`/products/${product.slug}`}>View product</Link></div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="why section shell" id="why-us">
        <motion.div {...reveal} className="section-label">03 / Why Alya</motion.div>
        <motion.div {...reveal} className="section-heading">
          <h2>A stronger link in your<br /><em>global supply chain.</em></h2>
          <p>We bring local access and international discipline together—so buying from Indonesia feels clear, reliable, and effortless.</p>
        </motion.div>
        <div className="feature-grid">
          {[
            [ShieldCheck, "Quality assurance", "Clear specifications, supplier verification, and pre-shipment inspection."],
            [PackageCheck, "Reliable supply", "A carefully managed producer network built around continuity and consistency."],
            [Globe2, "International standards", "Export documentation and packaging aligned with destination requirements."],
            [Ship, "Global logistics", "Coordinated air and sea freight with transparent milestone updates."],
            [Sparkles, "Tailored sourcing", "Products, grades, packaging, and volumes matched to your exact brief."],
            [Mail, "Fast response", "Direct, professional communication from inquiry through delivery."],
          ].map(([Icon, title, copy], i) => (
            <motion.div {...reveal} className="feature" key={title as string}>
              <span className="feature-no">0{i + 1}</span><Icon size={26} strokeWidth={1.3} />
              <h3>{title as string}</h3><p>{copy as string}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="process section" id="process">
        <div className="process-bg" />
        <div className="shell process-content">
          <motion.div {...reveal} className="section-label light">04 / How it works</motion.div>
          <motion.h2 {...reveal}>From inquiry to arrival,<br /><em>we make it seamless.</em></motion.h2>
          <div className="timeline">
            {[["01", "Tell us what you need", "Share your product, quantity, specification, and destination."], ["02", "We source & verify", "We identify the right producer, confirm specifications, and prepare samples."], ["03", "Approve your quotation", "Receive clear pricing, terms, packaging options, and lead time."], ["04", "We deliver worldwide", "We manage quality control, export documents, and international shipping."]].map(([n,t,c]) => (
              <motion.div {...reveal} className="step" key={n}><span>{n}</span><h3>{t}</h3><p>{c}</p></motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="standards section shell">
        <motion.div {...reveal} className="section-label">05 / Compliance ready</motion.div>
        <div className="standards-grid">
          <motion.div {...reveal}><h2>Documentation that<br /><em>travels with confidence.</em></h2><p>We coordinate product-specific documentation and work with qualified partners to support smooth clearance at destination.</p></motion.div>
          <motion.div {...reveal} className="cert-grid">
            {["NIB", "NPWP", "Export License", "Halal", "HACCP", "ISO-ready"].map((cert, i) => <div key={cert}><span>0{i+1}</span><b>{cert}</b><small>Available where applicable</small></div>)}
          </motion.div>
        </div>
      </section>

      <section className="contact section" id="contact">
        <div className="shell contact-grid">
          <motion.div {...reveal}>
            <div className="section-label light">06 / Start a conversation</div>
            <h2>Ready to source from<br /><em>Indonesia?</em></h2>
            <p>Tell us what you’re looking for. Our export team will respond with availability, specifications, and a tailored quotation.</p>
          </motion.div>
          <motion.div {...reveal} className="contact-card">
            <a className="contact-row" href="https://wa.me/6281234567890?text=Hello%20ALYA%20Global%20Trade%2C%0A%0AI%20am%20interested%20in%20your%20products.%20Please%20provide%20a%20quotation%20and%20additional%20information.%0A%0AThank%20you." target="_blank" rel="noreferrer">
              <span className="contact-icon">WA</span><span><small>WhatsApp</small><b>+62 812 3456 7890</b></span><ArrowRight />
            </a>
            <a className="contact-row" href="mailto:hello@alyaglobaltrade.com?subject=Product%20Inquiry%20-%20ALYA%20Global%20Trade">
              <span className="contact-icon"><Mail /></span><span><small>Email</small><b>hello@alyaglobaltrade.com</b></span><ArrowRight />
            </a>
            <div className="contact-row">
              <span className="contact-icon"><MapPin /></span><span><small>Office</small><b>Jakarta, Indonesia</b></span>
            </div>
            <p className="hours">Business hours · Mon–Fri, 09:00–17:00 WIB</p>
          </motion.div>
        </div>
      </section>

      <footer>
        <div className="shell footer-top">
          <div><div className="brand footer-brand"><span className="brand-mark">A</span><span>ALYA <b>GLOBAL TRADE</b></span></div><p>Connecting Indonesia to global markets through trusted products and responsible partnerships.</p></div>
          <div><small>Explore</small><a href="#about">About</a><a href="#products">Products</a><a href="#process">How it works</a></div>
          <div><small>Connect</small><a href="#contact">Contact</a><a href="mailto:hello@alyaglobaltrade.com">Email</a><a href="https://wa.me/6281234567890">WhatsApp</a></div>
          <div><small>Head office</small><p>Jakarta, Indonesia<br />Serving buyers worldwide</p></div>
        </div>
        <div className="shell footer-bottom"><span>© {new Date().getFullYear()} ALYA Global Trade</span><span>Premium Indonesian products · Global business</span></div>
      </footer>
    </main>
  );
}
