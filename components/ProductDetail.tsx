"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, FileCheck2, MapPin, PackageCheck, Ship } from "lucide-react";
import type { Product } from "@/data/products";
import { Header } from "./Header";
import { QuotationForm } from "./QuotationForm";
import { SampleRequestForm } from "./SampleRequestForm";
import { SpecificationTable } from "./SpecificationTable";

const reveal = { initial:{opacity:0,y:25}, whileInView:{opacity:1,y:0}, viewport:{once:true,margin:"-60px"}, transition:{duration:.65} };

export function ProductDetail({ product, related = [], documents = [] }: { product: Product; related?: Product[]; documents?: string[] }) {
  const exportDocuments = documents.length ? documents : ["Commercial Invoice","Packing List","Certificate of Origin","Phytosanitary Certificate","Fumigation Certificate — when required","Bill of Lading / Air Waybill","Product Specification Sheet","Certificate of Analysis — when available"];
  return <main className="b2b-product-page">
    <div className="detail-header-wrap"><Header /></div>
    <section className="b2b-product-hero">
      <div className="shell b2b-product-hero-grid">
        <motion.div initial={{opacity:0,x:-24}} animate={{opacity:1,x:0}} className="b2b-product-image"><Image src={product.image} alt={`${product.name} supplied for B2B export buyers`} fill priority sizes="(max-width:900px) 100vw,55vw" /></motion.div>
        <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} className="b2b-product-copy"><Link href="/#products" className="back-link"><ArrowLeft size={15}/> All vanilla products</Link><div className="eyebrow"><span/> {product.category}</div><h1>{product.name}</h1><p>{product.description}</p>
          <div className="b2b-summary"><span><small>Grade</small><b>{product.grade}</b></span><span><small>Typical length</small><b>{product.typicalLength}</b></span><span><small>Moisture</small><b>{product.moisture}</b></span><span><small>MOQ</small><b>{product.moq}</b></span></div>
          <div className="b2b-hero-actions"><a href="#request-quotation" className="btn btn-gold">Request a quotation <ArrowRight size={16}/></a><a href="#request-sample" className="btn btn-outline">Request a sample</a></div>
        </motion.div>
      </div>
    </section>
    <section className="product-gallery-section shell"><div className="product-gallery-three">{product.gallery.map((image,i)=><motion.div {...reveal} key={image}><Image src={image} alt={`${product.name} ${i===0?"whole bean detail":i===1?"export presentation":"related grade comparison"}`} fill sizes="(max-width:700px) 100vw,33vw" /></motion.div>)}</div></section>
    <section className="product-spec-section"><div className="shell product-two-col"><motion.div {...reveal}><div className="section-label">Technical specification</div><h2>Specification-led<br/><em>B2B sourcing.</em></h2><p>Values marked for confirmation are finalized against the approved lot, sample, and buyer specification. We do not present unverified commercial figures as fixed claims.</p></motion.div><motion.div {...reveal}><SpecificationTable items={product.specifications}/></motion.div></div></section>
    <section className="product-commercial shell"><div className="section-label">Commercial readiness</div><div className="commercial-grid">
      <motion.article {...reveal}><MapPin/><h3>Origin & sourcing</h3><p>{product.origin}. Exact farm or supplier region and traceability scope are confirmed per lot.</p></motion.article>
      <motion.article {...reveal}><PackageCheck/><h3>Packaging options</h3>{product.packaging.map(x=><span key={x}><Check/> {x}</span>)}</motion.article>
      <motion.article {...reveal}><Ship/><h3>Supply & delivery</h3><span><small>Monthly capacity</small>{product.monthlyCapacity}</span><span><small>Lead time</small>{product.leadTime}</span><span><small>Shipping</small>{product.shipping}</span></motion.article>
    </div></section>
    <section className="product-documents"><div className="shell product-two-col"><motion.div {...reveal}><div className="section-label light">Export documentation</div><h2>Prepared around<br/><em>destination needs.</em></h2><p>Availability depends on the destination, shipment, and agreement. Documents are never represented as universally available.</p></motion.div><div className="product-document-list">{exportDocuments.map(x=><motion.div {...reveal} key={x}><FileCheck2/><span>{x}</span></motion.div>)}</div></div></section>
    <section className="product-inquiry-tabs shell" id="request-quotation"><motion.div {...reveal} className="inquiry-intro"><div className="section-label">Qualified buyer inquiry</div><h2>Discuss your<br/><em>requirements.</em></h2><p>Submit your business requirements for a specification-led quotation. A unique inquiry reference is generated after successful submission.</p></motion.div><QuotationForm product={product.name} grade={product.grade} sourcePage={`/products/${product.slug}`}/></section>
    <section className="sample-request-section" id="request-sample"><div className="shell product-two-col"><motion.div {...reveal}><div className="section-label light">Sample request</div><h2>Evaluate before<br/><em>bulk sourcing.</em></h2><p>Samples are subject to approval. Shipping fees may apply, and product specifications are confirmed before dispatch.</p></motion.div><motion.div {...reveal}><SampleRequestForm product={product.name} grade={product.grade} sourcePage={`/products/${product.slug}`}/></motion.div></div></section>
    <section className="product-faq shell"><div className="section-label">Buyer FAQ</div><div className="faq-grid"><h2>Commercial questions,<br/><em>answered clearly.</em></h2><div>{product.faqs.map(item=><details key={item.question}><summary>{item.question}<span>+</span></summary><p>{item.answer}</p></details>)}</div></div></section>
    <section className="related-products shell"><div className="section-heading"><h2>Related vanilla<br/><em>products.</em></h2><Link href="/#products" className="text-link">View product range <ArrowRight size={15}/></Link></div><div className="related-grid">{related.map(item=><Link href={`/products/${item.slug}`} key={item.slug}><span className="related-image"><Image src={item.image} alt={item.name} fill sizes="(max-width:700px) 100vw,33vw"/></span><small>{item.category}</small><h3>{item.name}</h3><span className="text-link">View specifications <ArrowRight size={14}/></span></Link>)}</div></section>
  </main>;
}
