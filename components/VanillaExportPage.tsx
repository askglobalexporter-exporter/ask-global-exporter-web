"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, FileCheck2, Leaf, MapPin, PackageCheck, Ship, Sprout } from "lucide-react";
import { Header } from "./Header";
import { QuotationForm } from "./QuotationForm";

const reveal = { initial: { opacity: 0, y: 28 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-70px" }, transition: { duration: .7 } };

const specs = [
  ["Botanical name", "Vanilla planifolia"], ["Origin", "Indonesia — exact region confirmed per lot"],
  ["Bean length", "To be confirmed against buyer specification"], ["Moisture", "Confirmed per approved lot"],
  ["Vanillin", "Certificate of Analysis when available"], ["Appearance", "Confirmed by grade and approved sample"],
  ["MOQ", "Available upon request"], ["Lead time", "Confirmed with quotation"],
  ["Shelf life", "Confirmed by packaging and specification"], ["Incoterms", "EXW, FOB, CFR, CIF, DAP — subject to agreement"],
];

const grades = [
  ["Gourmet Grade A", "To be confirmed", "Confirmed per lot", "Premium culinary, pastry, hospitality"],
  ["Extraction Grade B", "To be confirmed", "Confirmed per lot", "Extract, paste, flavor manufacturing"],
  ["Vanilla Cuts", "Custom cut size", "Confirmed per lot", "Industrial processing and milling"],
];

const process = [
  [Sprout, "Farm Selection", "Partner farms are selected for cultivation practices, traceability, and harvest consistency."],
  [Leaf, "Harvesting", "Mature green pods are hand-picked at the optimal stage for aroma development."],
  ["03", "Curing", "Controlled blanching, sweating, drying, and conditioning develop the signature vanilla profile."],
  ["04", "Sorting", "Every bean is graded by length, moisture, appearance, and aroma."],
  [PackageCheck, "Vacuum Packaging", "Food-grade vacuum packs protect moisture and aroma during international transit."],
  [Ship, "International Shipping", "Documents and freight are coordinated for reliable delivery to your destination."],
];

const faqs = [
  ["Can I request samples before a bulk order?", "Yes. Qualified buyers can request representative grade samples. Sample and courier costs are confirmed based on destination."],
  ["Which vanilla grades are available?", "We supply Gourmet Grade A, Extraction Grade B, and cut or split beans. Custom sorting by length and moisture can be discussed."],
  ["What is the minimum order quantity?", "MOQ is available upon request and depends on grade, packaging, lot availability, and destination."],
  ["Can you provide private-label packaging?", "Yes. We can support buyer labels, carton markings, inner pack sizes, and other export packaging requirements."],
  ["Which export documents are provided?", "Commercial Invoice and Packing List are standard. Certificate of Origin, Phytosanitary, Fumigation, and other documents are arranged where required."],
  ["How long does an order take?", "Lead time is confirmed with the quotation and depends on lot availability, volume, packaging, and documentation."],
];

export function VanillaExportPage() {
  const whatsapp = "https://wa.me/6287810119696?text=" + encodeURIComponent("Hello ALYA Global Trade, I am interested in Indonesian vanilla beans. Please send your export price list and available grades.");
  return <main className="vanilla-page">
    <div className="vanilla-nav"><Header /></div>
    <section className="vanilla-product-hero">
      <Image src="/hero-vanilla.png" alt="Premium Indonesian vanilla beans for export" fill priority sizes="100vw" />
      <div className="vanilla-hero-overlay" />
      <div className="shell vanilla-hero-copy">
        <Link href="/" className="back-link"><ArrowLeft size={15} /> Alya Global Trade</Link>
        <div className="eyebrow"><span /> Direct Indonesian exporter</div>
        <h1>Indonesian<br /><em>Vanilla Beans.</em></h1>
        <p>Export-ready Planifolia vanilla, carefully cured and graded for importers, distributors, manufacturers, and premium food brands.</p>
        <div className="vanilla-hero-actions"><a href="#quotation" className="btn btn-gold">Request quotation <ArrowRight size={16}/></a><a href={whatsapp} target="_blank" rel="noreferrer" className="btn btn-glass">Get price list</a></div>
        <div className="vanilla-trust"><span><Check /> MOQ upon request</span><span><Check /> International shipping</span><span><Check /> Export document support</span></div>
      </div>
    </section>

    <section className="vanilla-intro vanilla-section shell">
      <motion.div {...reveal} className="section-label">01 / Product overview</motion.div>
      <div className="vanilla-intro-grid">
        <motion.div {...reveal}><h2>Built for buyers who need<br /><em>consistency at scale.</em></h2></motion.div>
        <motion.div {...reveal}><p>Our Indonesian Vanilla planifolia is sourced through selected vanilla-specific suppliers, then cured and sorted against buyer requirements. Exact origin, grade, moisture, and commercial specifications are confirmed per approved lot.</p><p>We support importers, ingredient distributors, extract manufacturers, bakeries, hospitality groups, and private-label brands.</p></motion.div>
      </div>
      <div className="vanilla-origin-grid">
        <motion.div {...reveal} className="origin-image"><Image src="/vanilla-grade-a.png" alt="Cured Indonesian Grade A vanilla beans" fill sizes="(max-width: 800px) 100vw, 60vw" /></motion.div>
        <motion.div {...reveal} className="origin-card"><MapPin/><small>Country of origin</small><h3>Indonesia</h3><p>Exact farm or supplier region, harvest information, and traceability scope are confirmed against the selected lot and commercial agreement.</p><div><span>Species <b>Vanilla planifolia</b></span><span>Availability <b>Confirmed per lot</b></span></div></motion.div>
      </div>
    </section>

    <section className="vanilla-specs vanilla-section">
      <div className="shell">
        <motion.div {...reveal} className="section-label">02 / Technical specification</motion.div>
        <div className="vanilla-spec-head"><motion.h2 {...reveal}>Clear specifications.<br /><em>Confident sourcing.</em></motion.h2><motion.p {...reveal}>Final parameters are confirmed against your purchase specification and the approved lot sample.</motion.p></div>
        <motion.div {...reveal} className="spec-table">{specs.map(([key,value])=><div key={key}><span>{key}</span><b>{value}</b></div>)}</motion.div>
        <motion.div {...reveal} className="grade-table"><div className="grade-row grade-head"><span>Available grade</span><span>Typical length</span><span>Moisture</span><span>Best for</span></div>{grades.map(row=><div className="grade-row" key={row[0]}>{row.map((cell,i)=><span key={cell}>{i===0?<b>{cell}</b>:cell}</span>)}</div>)}</motion.div>
      </div>
    </section>

    <section className="vanilla-gallery vanilla-section shell">
      <motion.div {...reveal} className="section-label">03 / Product gallery</motion.div>
      <div className="vanilla-gallery-grid">
        <motion.div {...reveal} className="gallery-large"><Image src="/vanilla-grade-a.png" alt="Whole premium Indonesian vanilla beans" fill sizes="(max-width: 800px) 100vw, 60vw" /></motion.div>
        <motion.div {...reveal}><Image src="/vanilla-grade-b.png" alt="Extraction-grade Indonesian vanilla beans" fill sizes="(max-width: 800px) 100vw, 40vw" /></motion.div>
        <motion.div {...reveal} className="gallery-detail"><Image src="/vanilla-cuts.png" alt="Indonesian vanilla cuts for extraction" fill sizes="(max-width: 800px) 100vw, 40vw" /></motion.div>
      </div>
    </section>

    <section className="export-process vanilla-section">
      <div className="shell">
        <motion.div {...reveal} className="section-label light">04 / Export process</motion.div>
        <motion.h2 {...reveal}>From selected farms<br /><em>to your destination.</em></motion.h2>
        <div className="export-process-grid">{process.map(([Icon,title,copy],i)=><motion.div {...reveal} className="export-step" key={title as string}><span>0{i+1}</span>{typeof Icon === "string" ? <b className="step-number-icon">{Icon}</b> : <Icon size={28}/>}<h3>{title as string}</h3><p>{copy as string}</p></motion.div>)}</div>
      </div>
    </section>

    <section className="compliance vanilla-section shell">
      <motion.div {...reveal} className="section-label">05 / Export compliance</motion.div>
      <div className="compliance-grid"><motion.div {...reveal}><h2>Documentation for<br /><em>smoother clearance.</em></h2><p>Document availability depends on the destination, shipment, and buyer requirements. Our team confirms the required set before order finalization.</p></motion.div><div className="document-list">{["Certificate of Origin","Phytosanitary Certificate","Commercial Invoice","Packing List","Fumigation Certificate"].map((x,i)=><motion.div {...reveal} key={x}><FileCheck2/><span><small>Document 0{i+1}</small><b>{x}</b></span><Check/></motion.div>)}</div></div>
    </section>

    <section className="packaging vanilla-section">
      <div className="shell packaging-grid"><motion.div {...reveal}><div className="section-label light">06 / Export packaging</div><h2>Protected for the<br /><em>journey ahead.</em></h2><p>Vacuum sealing helps preserve bean moisture and aroma. Inner packs are placed in food-grade export cartons with buyer-specific labels and shipping marks.</p><div className="packaging-options"><span>1 kg vacuum pack</span><span>5 kg vacuum pack</span><span>10 kg bulk carton</span><span>Custom buyer specification</span></div></motion.div><motion.div {...reveal} className="packaging-image"><Image src="/hero-vanilla.png" alt="Premium vanilla beans export packaging" fill sizes="(max-width: 800px) 100vw, 50vw" /></motion.div></div>
    </section>

    <section className="quotation vanilla-section" id="quotation">
      <div className="shell quotation-grid"><motion.div {...reveal}><div className="section-label">07 / Buyer inquiry</div><h2>Request your<br /><em>export quotation.</em></h2><p>Share your target grade, quantity, packaging, and destination. We will respond with current availability, specifications, lead time, and commercial terms.</p><div className="quotation-side-ctas"><a href={whatsapp} target="_blank" rel="noreferrer">Request Sample <ArrowRight/></a><a href={whatsapp} target="_blank" rel="noreferrer">Get Export Price List <ArrowRight/></a></div></motion.div><motion.div {...reveal}><QuotationForm/></motion.div></div>
    </section>

    <section className="vanilla-faq vanilla-section shell">
      <motion.div {...reveal} className="section-label">08 / Frequently asked questions</motion.div>
      <div className="faq-grid"><motion.h2 {...reveal}>Buyer questions,<br /><em>answered clearly.</em></motion.h2><div>{faqs.map(([q,a])=><motion.details {...reveal} key={q}><summary>{q}<span>+</span></summary><p>{a}</p></motion.details>)}</div></div>
    </section>

    <section className="vanilla-final-cta"><div className="shell"><motion.div {...reveal}><small>Start your sourcing conversation</small><h2>Premium vanilla.<br /><em>Reliable export.</em></h2><div><a href="#quotation" className="btn btn-gold">Request quotation <ArrowRight/></a><a href={whatsapp} target="_blank" rel="noreferrer" className="btn btn-glass">Request sample</a></div></motion.div></div></section>
    <footer className="vanilla-footer"><div className="shell"><span>© {new Date().getFullYear()} ALYA Global Trade</span><span>Indonesian Vanilla Beans · Global Supply</span></div></footer>
  </main>;
}
