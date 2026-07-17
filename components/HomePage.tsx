"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Check, Globe2, Mail, MapPin, PackageCheck, Quote, ShieldCheck, Ship, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Header } from "./Header";
import { BrandLogo } from "./BrandLogo";
import { products as fallbackProducts, type Product } from "@/data/products";
import type { CmsEntry, HomepageHeroSlide, HomepageSection } from "@/lib/public-content";
import { useCompanySettings } from "./CompanySettingsProvider";
import { resolvedHomepageContent } from "@/lib/homepage-sections";

const ease = [0.22, 1, 0.36, 1] as const;
const reveal = { initial: { opacity: 0, y: 28 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-80px" }, transition: { duration: .75, ease } };

type SectionConfig = Record<string, HomepageSection>;
type HomeContent = { about:CmsEntry[];companyProfile:CmsEntry[];faqs:CmsEntry[];testimonials:CmsEntry[];blog:CmsEntry[];exportDocuments:CmsEntry[] };

export function HomePage({ catalog = fallbackProducts, heroSlides = [], sectionConfig = {}, content }: { catalog?: Product[]; heroSlides?: HomepageHeroSlide[]; sectionConfig?: SectionConfig; content?:HomeContent }) {
  const company = useCompanySettings();
  const whatsappNumber = company.whatsapp_number.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello ${company.brand_name},\n\nI am interested in your products. Please provide a quotation and additional information.\n\nThank you.`)}`;
  const hero = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: hero, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.12]);

  const [activeHero, setActiveHero] = useState(0);
  const visible = (key: string) => sectionConfig[key]?.is_visible ?? true;
  const order = (key: string) => ({ order: sectionConfig[key]?.position ?? 0 });
  const section = (key:string) => resolvedHomepageContent(key, sectionConfig[key]?.content);
  const fallbackHero = section("hero");
  const slides: HomepageHeroSlide[] = heroSlides.length ? heroSlides : [{ id:"default-hero", eyebrow:fallbackHero.eyebrow ?? "", title:fallbackHero.title ?? "", summary:fallbackHero.summary ?? "", image_url:fallbackHero.image_url ?? "/vanilla-grade-a.webp", mobile_image_url:null, desktop_position:"center right", mobile_position:"center center", cta_label:fallbackHero.cta_label ?? "Request quotation", cta_url:fallbackHero.cta_url ?? "/products/vanilla-beans#quotation", position:0, is_visible:true }];
  const activeSlide = slides[Math.min(activeHero, slides.length - 1)];
  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => setActiveHero((current) => (current + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [slides.length]);
  const about = content?.about.find((entry)=>entry.slug === "company-overview") ?? content?.about[0];
  const promise = content?.companyProfile.find((entry)=>entry.slug === "company-principle") ?? content?.companyProfile[0];
  const documents = content?.exportDocuments.length ? content.exportDocuments : ["Commercial Invoice", "Packing List", "Certificate of Origin", "Phytosanitary", "Fumigation", "Specification Sheet"].map((title,index)=>({id:String(index),title,excerpt:"Subject to shipment requirements"} as CmsEntry));
  return (
    <main style={{ display: "flex", flexDirection: "column" }}>
      {visible("hero") && <section className="hero" ref={hero} style={{...order("hero"),"--hero-image":`url("${activeSlide.image_url}")`,"--hero-mobile-image":`url("${activeSlide.mobile_image_url || activeSlide.image_url}")`,"--hero-desktop-position":activeSlide.desktop_position,"--hero-mobile-position":activeSlide.mobile_position} as CSSProperties}>
        <AnimatePresence initial={false}><motion.div key={activeSlide.id} className="hero-image" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.7}} style={{ y: heroY, scale: heroScale, backgroundImage:`url("${activeSlide.image_url}")` }} /></AnimatePresence>
        <div className="hero-shade" />
        <Header />
        <AnimatePresence mode="wait"><motion.div key={activeSlide.id} className="mobile-hero-copy shell" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{opacity:0,y:-12}} transition={{ duration: .55, ease }}>
          <div className="eyebrow"><span /> {activeSlide.eyebrow}</div>
          <h1>{activeSlide.title}</h1>
          <p>{activeSlide.summary}</p>
          <Link href={activeSlide.cta_url} className="btn btn-gold">{activeSlide.cta_label} <ArrowRight size={16} /></Link>
        </motion.div></AnimatePresence>
        {slides.length > 1 && <div className="hero-slide-controls shell" aria-label="Hero slideshow">{slides.map((slide,index)=><button key={slide.id} type="button" className={index === activeHero ? "active" : ""} onClick={()=>setActiveHero(index)} aria-label={`Tampilkan slide ${index + 1}`} />)}</div>}
      </section>}

      {visible("about") && <section className="intro section shell" id="about" style={order("about")}>
        <motion.div {...reveal} className="section-label">01 / Who we are</motion.div>
        <div className="intro-grid">
          <motion.h2 {...reveal}>{section("about").title || "From the heart of Indonesia, to businesses worldwide."}</motion.h2>
          <motion.div {...reveal} className="intro-copy">
            <p>{about?.excerpt || "ASK Global is an Indonesian trading company connecting global buyers with premium Indonesian commodities."}</p>
            <p>{about?.content?.body || "We serve manufacturers, flavor houses, extract producers, food ingredient companies, distributors, and importers seeking dependable sourcing partners from Indonesia."}</p>
            <Link href={about?.content?.cta_url || "/about"} className="text-link">{about?.content?.cta_label || "Learn about Ask Global"} <ArrowRight size={15} /></Link>
          </motion.div>
        </div>
        <motion.div {...reveal} className="promise-card">
          <div className="promise-image" />
          <div className="promise-copy">
            <div className="eyebrow"><span /> Our promise</div>
            <h3>{promise?.title || "Long-term partnerships, earned."}</h3>
            <p>{promise?.excerpt || "We are built on a simple principle: long-term partnerships are earned through consistency, transparency, and reliable execution—not one-off transactions."}</p>
            <p>{promise?.content?.body || "We work closely with trusted farmers, processors, and local suppliers across Indonesia to ensure consistent quality, reliable supply, and products that meet international market expectations."}</p>
            <div className="mini-values">
              <span><Check /> Traceable sourcing</span><span><Check /> Consistent quality</span><span><Check /> Clear communication</span>
            </div>
          </div>
        </motion.div>
      </section>}

      {visible("products") && <section className="products-section section" id="products" style={order("products")}>
        <div className="shell">
          <motion.div {...reveal} className="section-label">02 / Vanilla product range</motion.div>
          <motion.div {...reveal} className="section-heading">
            <h2>{section("products").title || "Indonesian vanilla, prepared for B2B buyers."}</h2>
            <p>{section("products").summary || "Explore whole-bean grades and processed formats. Final specifications and commercial availability are confirmed per lot and quotation."}</p>
          </motion.div>
          <div className="product-grid">
            {catalog.map((product, index) => (
              <motion.article {...reveal} transition={{ ...reveal.transition, delay: (index % 3) * .08 }} className="product-card" key={product.slug}>
                <Link href={`/products/${product.slug}`} className="product-image-wrap" aria-label={`View ${product.name}`}>
                  <Image src={product.image} alt={product.name} fill sizes="(max-width: 800px) 100vw, 33vw" className="product-image" />
                  <span className="product-index">0{index + 1}</span>
                  <span className="product-arrow"><ArrowRight size={18} /></span>
                </Link>
                <div className="product-meta"><span>{product.category}</span><span>{product.origin}</span></div>
                <h3><Link href={`/products/${product.slug}`}>{product.name}</Link></h3>
                <p>{product.shortDescription || product.description}</p>
                <div className="product-card-specs"><span><small>Length</small>{product.typicalLength}</span><span><small>Moisture</small>{product.moisture}</span><span><small>Application</small>{product.application}</span></div>
                <div className="product-footer"><Link href={`/products/${product.slug}`}>View specifications</Link><Link href={`/products/${product.slug}#request-quotation`}>Request quotation</Link></div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>}

      {visible("focus") && <section className="why section shell" id="why-us" style={order("focus")}>
        <motion.div {...reveal} className="section-label">03 / Our focus</motion.div>
        <motion.div {...reveal} className="section-heading">
          <h2>{section("focus").title || "Indonesian supply, built for global business."}</h2>
          <p>{section("focus").summary || "Our sourcing network and trading capabilities support buyers across six core areas."}</p>
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
      </section>}

      {visible("process") && <section className="process section" id="process" style={order("process")}>
        <div className="process-bg" />
        <div className="shell process-content">
          <motion.div {...reveal} className="section-label light">04 / Vanilla export process</motion.div>
          <motion.h2 {...reveal}>{section("process").title || "From supplier sourcing to international shipping."}</motion.h2>
          <div className="timeline">
            {[["01", "Supplier sourcing", "Vanilla-specific farmer and supplier sourcing aligned with buyer needs."], ["02", "Harvest selection", "Pods are selected for maturity and intended product grade."], ["03", "Curing", "A controlled curing sequence develops aroma, color, and texture."], ["04", "Sorting & grading", "Beans are grouped against the agreed commercial specification."], ["05", "Quality inspection", "The selected lot is checked before packing and dispatch."], ["06", "Vacuum packaging", "Food-grade vacuum packing protects moisture and aroma."], ["07", "Export documents", "The shipment document set is confirmed for the destination."], ["08", "International shipping", "Air or sea freight is coordinated under the agreed Incoterm."]].map(([n,t,c]) => (
              <motion.div {...reveal} className="step" key={n}><span>{n}</span><h3>{t}</h3><p>{c}</p></motion.div>
            ))}
          </div>
        </div>
      </section>}

      {visible("compliance") && <section className="standards section shell" style={order("compliance")}>
        <motion.div {...reveal} className="section-label">05 / Compliance ready</motion.div>
        <div className="standards-grid">
          <motion.div {...reveal}><h2>{section("compliance").title || "Documentation that supports each shipment."}</h2><p>{section("compliance").summary || "Availability depends on destination rules, shipment type, and agreement. We confirm the required document set before order finalization."}</p></motion.div>
          <motion.div {...reveal} className="cert-grid">
            {documents.map((document, i) => <div key={document.id}><span>0{i+1}</span><b>{document.title}</b><small>{document.excerpt || document.content?.body || "Subject to shipment requirements"}</small></div>)}
          </motion.div>
        </div>
      </section>}

      {visible("testimonials") && Boolean(content?.testimonials.length) && <section className="home-cms-section section shell" style={order("testimonials")}>
        <motion.div {...reveal} className="section-label">06 / Buyer confidence</motion.div>
        <motion.div {...reveal} className="section-heading"><h2>{section("testimonials").title || "Partnerships built on reliable execution."}</h2><p>{section("testimonials").summary || "Selected feedback from buyers and commercial partners."}</p></motion.div>
        <div className="testimonial-grid">{content!.testimonials.slice(0,3).map((entry)=><motion.blockquote {...reveal} key={entry.id}><Quote size={24}/><p>{entry.content?.body || entry.excerpt}</p><footer><b>{entry.content?.author || entry.title}</b><span>{[entry.content?.role,entry.content?.company].filter(Boolean).join(" · ")}</span></footer></motion.blockquote>)}</div>
      </section>}

      {visible("faq") && Boolean(content?.faqs.length) && <section className="home-cms-section home-faq section shell" style={order("faq")}>
        <motion.div {...reveal} className="section-label">07 / Buyer FAQ</motion.div>
        <div className="faq-grid"><motion.h2 {...reveal}>{section("faq").title || "Questions global buyers ask before sourcing."}</motion.h2><div>{content!.faqs.map((entry)=><motion.details {...reveal} key={entry.id}><summary>{entry.content?.question || entry.title}<span>+</span></summary><p>{entry.content?.answer || entry.content?.body || entry.excerpt}</p></motion.details>)}</div></div>
      </section>}

      {visible("blog") && Boolean(content?.blog.length) && <section className="home-cms-section home-blog section shell" style={order("blog")}>
        <motion.div {...reveal} className="section-label">08 / Trade insights</motion.div>
        <motion.div {...reveal} className="section-heading"><h2>{section("blog").title || "Insights for responsible sourcing."}</h2><Link href="/blog" className="text-link">View all insights <ArrowRight size={15}/></Link></motion.div>
        <div className="blog-card-grid">{content!.blog.slice(0,3).map((entry)=><motion.article {...reveal} key={entry.id}>{entry.featured_image_url && <Link href={`/blog/${entry.slug}`} className="blog-card-image"><Image src={entry.featured_image_url} alt={entry.title} fill sizes="(max-width:800px) 100vw,33vw"/></Link>}<small>{entry.published_at ? new Date(entry.published_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}) : "Ask Global"}</small><h3><Link href={`/blog/${entry.slug}`}>{entry.title}</Link></h3><p>{entry.excerpt}</p><Link href={`/blog/${entry.slug}`} className="text-link">Read article <ArrowRight size={14}/></Link></motion.article>)}</div>
      </section>}

      {visible("contact") && <section className="contact section" id="contact" style={order("contact")}>
        <div className="shell contact-grid">
          <motion.div {...reveal}>
            <div className="section-label light">06 / Start a conversation</div>
            <h2>{section("contact").title || "Ready to source from Indonesia?"}</h2>
            <p>{section("contact").summary || "Share your product, specification, quantity, packaging, and destination. Our team will respond with availability and the next sourcing steps."}</p>
          </motion.div>
          <motion.div {...reveal} className="contact-card">
            <a className="contact-row" href={whatsappUrl} target="_blank" rel="noreferrer">
              <span className="contact-icon">{company.whatsapp_logo_url ? <Image src={company.whatsapp_logo_url} alt="WhatsApp" width={22} height={22} unoptimized /> : "WA"}</span><span><small>WhatsApp</small><b>{company.whatsapp_display}</b></span><ArrowRight />
            </a>
            <a className="contact-row" href={`mailto:${company.email}?subject=${encodeURIComponent(`Product Inquiry - ${company.brand_name}`)}`}>
              <span className="contact-icon"><Mail /></span><span><small>Email</small><b>{company.email}</b></span><ArrowRight />
            </a>
            <div className="contact-row">
              <span className="contact-icon"><MapPin /></span><span><small>Office</small><b>{company.address}</b></span>
            </div>
            <p className="hours">Business hours · {company.business_hours}</p>
          </motion.div>
        </div>
      </section>}

      <footer style={{ order: 99 }}>
        <div className="shell footer-top">
          <div><div className="brand footer-brand"><BrandLogo /></div><p>{company.description}</p></div>
          <div><small>Explore</small><a href="#about">About</a><a href="#products">Products</a><a href="#process">How it works</a></div>
          <div><small>Connect</small><a href="#contact">Contact</a><a href={`mailto:${company.email}`}>Email</a><a href={`https://wa.me/${whatsappNumber}`}>WhatsApp</a></div>
          <div><small>Head office</small><p>{company.address}<br />{company.service_area}</p></div>
        </div>
        <div className="shell footer-bottom"><span>© {new Date().getFullYear()} {company.brand_name}</span><span>{company.tagline}</span></div>
      </footer>
    </main>
  );
}
