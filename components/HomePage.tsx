"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Check, Globe2, Mail, MapPin, PackageCheck, ShieldCheck, Ship, Sparkles } from "lucide-react";
import { useRef } from "react";
import { Header } from "./Header";
import { BrandLogo } from "./BrandLogo";
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
        <Link className="hero-quote-hotspot" href="/products/vanilla-beans#quotation" aria-label="Request quotation for premium vanilla beans" />
        <motion.div className="mobile-hero-copy shell" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .2, ease }}>
          <div className="eyebrow"><span /> Premium Indonesian vanilla</div>
          <h1>Vanilla <em>Beans</em></h1>
          <p>Natural, aromatic, and export-ready—sourced with care in Indonesia.</p>
          <Link href="/products/vanilla-beans#quotation" className="btn btn-gold">Request quotation <ArrowRight size={16} /></Link>
        </motion.div>
      </section>

      <section className="intro section shell" id="about">
        <motion.div {...reveal} className="section-label">01 / Who we are</motion.div>
        <div className="intro-grid">
          <motion.h2 {...reveal}>From the heart of Indonesia,<br /><em>to businesses worldwide.</em></motion.h2>
          <motion.div {...reveal} className="intro-copy">
            <p>ASK Global is an Indonesian trading company connecting global buyers with premium Indonesian commodities.</p>
            <p>We serve manufacturers, flavor houses, extract producers, food ingredient companies, distributors, and importers seeking dependable sourcing partners from Indonesia.</p>
            <a href="#why-us" className="text-link">Discover our standards <ArrowRight size={15} /></a>
          </motion.div>
        </div>
        <motion.div {...reveal} className="promise-card">
          <div className="promise-image" />
          <div className="promise-copy">
            <div className="eyebrow"><span /> Our promise</div>
            <h3>Long-term partnerships, earned.</h3>
            <p>We are built on a simple principle: long-term partnerships are earned through consistency, transparency, and reliable execution&mdash;not one-off transactions.</p>
            <p>We work closely with trusted farmers, processors, and local suppliers across Indonesia to ensure consistent quality, reliable supply, and products that meet international market expectations.</p>
            <div className="mini-values">
              <span><Check /> Traceable sourcing</span><span><Check /> Consistent quality</span><span><Check /> Clear communication</span>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="products-section section" id="products">
        <div className="shell">
          <motion.div {...reveal} className="section-label">02 / Vanilla product range</motion.div>
          <motion.div {...reveal} className="section-heading">
            <h2>Indonesian vanilla,<br /><em>prepared for B2B buyers.</em></h2>
            <p>Explore whole-bean grades and processed formats. Final specifications and commercial availability are confirmed per lot and quotation.</p>
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
                <div className="product-card-specs"><span><small>Length</small>{product.typicalLength}</span><span><small>Moisture</small>{product.moisture}</span><span><small>Application</small>{product.application}</span></div>
                <div className="product-footer"><Link href={`/products/${product.slug}`}>View specifications</Link><Link href={`/products/${product.slug}#request-quotation`}>Request quotation</Link></div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="why section shell" id="why-us">
        <motion.div {...reveal} className="section-label">03 / Our focus</motion.div>
        <motion.div {...reveal} className="section-heading">
          <h2>Indonesian supply,<br /><em>built for global business.</em></h2>
          <p>Our sourcing network and trading capabilities support buyers across six core areas.</p>
        </motion.div>
        <div className="feature-grid">
          {[
            [ShieldCheck, "Agricultural Commodities", "Specification-led sourcing from trusted Indonesian producers and suppliers."],
            [PackageCheck, "Plantation Products", "Reliable access to plantation-grown products for international B2B requirements."],
            [Sparkles, "Spices", "Indonesian spices sourced for manufacturers, distributors, and ingredient buyers."],
            [Globe2, "Natural Ingredients", "Natural Indonesian ingredients aligned with buyer applications and quality expectations."],
            [Mail, "Private Label", "Flexible product, packaging, and labeling coordination for qualified buyer programs."],
            [Ship, "Global Trading", "Transparent commercial coordination, export documentation, and international logistics."],
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
          <motion.div {...reveal} className="section-label light">04 / Vanilla export process</motion.div>
          <motion.h2 {...reveal}>From supplier sourcing<br /><em>to international shipping.</em></motion.h2>
          <div className="timeline">
            {[["01", "Supplier sourcing", "Vanilla-specific farmer and supplier sourcing aligned with buyer needs."], ["02", "Harvest selection", "Pods are selected for maturity and intended product grade."], ["03", "Curing", "A controlled curing sequence develops aroma, color, and texture."], ["04", "Sorting & grading", "Beans are grouped against the agreed commercial specification."], ["05", "Quality inspection", "The selected lot is checked before packing and dispatch."], ["06", "Vacuum packaging", "Food-grade vacuum packing protects moisture and aroma."], ["07", "Export documents", "The shipment document set is confirmed for the destination."], ["08", "International shipping", "Air or sea freight is coordinated under the agreed Incoterm."]].map(([n,t,c]) => (
              <motion.div {...reveal} className="step" key={n}><span>{n}</span><h3>{t}</h3><p>{c}</p></motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="standards section shell">
        <motion.div {...reveal} className="section-label">05 / Compliance ready</motion.div>
        <div className="standards-grid">
          <motion.div {...reveal}><h2>Documentation that<br /><em>supports each shipment.</em></h2><p>Availability depends on destination rules, shipment type, and agreement. We confirm the required document set before order finalization.</p></motion.div>
          <motion.div {...reveal} className="cert-grid">
            {["Commercial Invoice", "Packing List", "Certificate of Origin", "Phytosanitary", "Fumigation", "Specification Sheet"].map((cert, i) => <div key={cert}><span>0{i+1}</span><b>{cert}</b><small>Subject to shipment requirements</small></div>)}
          </motion.div>
        </div>
      </section>

      <section className="contact section" id="contact">
        <div className="shell contact-grid">
          <motion.div {...reveal}>
            <div className="section-label light">06 / Start a conversation</div>
            <h2>Ready to source<br /><em>from Indonesia?</em></h2>
            <p>Share your product, specification, quantity, packaging, and destination. Our team will respond with availability and the next sourcing steps.</p>
          </motion.div>
          <motion.div {...reveal} className="contact-card">
            <a className="contact-row" href="https://wa.me/6285196598995?text=Hello%20Ask%20Global%2C%0A%0AI%20am%20interested%20in%20your%20products.%20Please%20provide%20a%20quotation%20and%20additional%20information.%0A%0AThank%20you." target="_blank" rel="noreferrer">
              <span className="contact-icon">WA</span><span><small>WhatsApp</small><b>+62 851-9659-8995</b></span><ArrowRight />
            </a>
            <a className="contact-row" href="mailto:askglobalexporter@gmail.com?subject=Product%20Inquiry%20-%20Ask%20Global">
              <span className="contact-icon"><Mail /></span><span><small>Email</small><b>askglobalexporter@gmail.com</b></span><ArrowRight />
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
          <div><div className="brand footer-brand"><BrandLogo /></div><p>Connecting global buyers with premium Indonesian commodities through consistent, transparent, and reliable trade.</p></div>
          <div><small>Explore</small><a href="#about">About</a><a href="#products">Products</a><a href="#process">How it works</a></div>
          <div><small>Connect</small><a href="#contact">Contact</a><a href="mailto:askglobalexporter@gmail.com">Email</a><a href="https://wa.me/6285196598995">WhatsApp</a></div>
          <div><small>Head office</small><p>Jakarta, Indonesia<br />Serving buyers worldwide</p></div>
        </div>
        <div className="shell footer-bottom"><span>© {new Date().getFullYear()} Ask Global</span><span>Indonesian commodities · Global trading</span></div>
      </footer>
    </main>
  );
}
