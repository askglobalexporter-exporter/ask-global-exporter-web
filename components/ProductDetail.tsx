"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Mail, Package, Ship } from "lucide-react";
import type { Product } from "@/data/products";
import { Header } from "./Header";

export function ProductDetail({ product }: { product: Product }) {
  const message = encodeURIComponent(`Hello,\n\nI am interested in the following product:\n\nProduct: ${product.name}\nQuantity:\nDestination Country:\n\nPlease provide quotation and additional information.\n\nThank you.`);
  const email = `mailto:hello@alyaglobaltrade.com?subject=${encodeURIComponent(`Quotation Request — ${product.name}`)}&body=${message}`;
  return <main className="detail-page">
    <div className="detail-header-wrap"><Header /></div>
    <section className="detail-hero shell">
      <motion.div initial={{opacity:0,x:-25}} animate={{opacity:1,x:0}} transition={{duration:.7}} className="detail-gallery">
        <div className="detail-main-image"><Image src={product.gallery[0]} alt={product.name} fill priority sizes="(max-width: 900px) 100vw, 55vw" /></div>
        <div className="detail-thumb"><Image src={product.gallery[1]} alt={`${product.name} detail`} fill sizes="220px" /></div>
        <span className="image-caption">Sourced in {product.origin}</span>
      </motion.div>
      <motion.div initial={{opacity:0,y:25}} animate={{opacity:1,y:0}} transition={{duration:.75,delay:.12}} className="detail-copy">
        <Link href="/#products" className="back-link"><ArrowLeft size={15}/> Back to products</Link>
        <div className="eyebrow"><span /> {product.category}</div>
        <h1>{product.name}</h1>
        <p className="detail-lead">{product.description}</p>
        <div className="quick-specs">
          <div><small>Origin</small><b>{product.origin}</b></div><div><small>Minimum order</small><b>{product.moq}</b></div><div><small>Grade</small><b>{product.grade}</b></div><div><small>Lead time</small><b>{product.leadTime}</b></div>
        </div>
        <a className="btn btn-gold full" href={`https://wa.me/6287810119696?text=${message}`} target="_blank" rel="noreferrer">Request quotation via WhatsApp <ArrowRight size={17}/></a>
        <a className="btn btn-outline full" href={email}>Send inquiry via email <Mail size={17}/></a>
      </motion.div>
    </section>
    <section className="detail-spec-section">
      <div className="shell detail-spec-grid">
        <div><div className="section-label">Product details</div><h2>Prepared for<br/><em>international trade.</em></h2></div>
        <div className="spec-list">
          <div><Package/><span><small>Packaging options</small>{product.packaging.map(x=><b key={x}><Check/> {x}</b>)}</span></div>
          <div><Ship/><span><small>Shipping availability</small><b>{product.shipping}</b></span></div>
          <div><Check/><span><small>Quality & documentation</small><b>Pre-shipment inspection available</b><b>Export documents coordinated</b><b>Certifications supplied where applicable</b></span></div>
        </div>
      </div>
    </section>
    <section className="detail-cta"><div className="shell"><h2>Need a custom grade,<br/>pack size, or volume?</h2><p>Share your exact requirements and destination. We’ll prepare a tailored sourcing proposal.</p><a href={`https://wa.me/6287810119696?text=${message}`} className="btn btn-gold">Talk to our export team <ArrowRight size={17}/></a></div></section>
  </main>;
}
