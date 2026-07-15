"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { quotationSchema, type QuotationInput } from "@/lib/inquiry-validation";
import { products } from "@/data/products";

export function QuotationForm({ product, grade, sourcePage = "/products/vanilla-beans" }: { product?: string; grade?: string; sourcePage?: string }) {
  const [reference, setReference] = useState(""); const [serverError, setServerError] = useState("");
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<QuotationInput>({
    resolver: zodResolver(quotationSchema), defaultValues: { product: product || "", grade: grade || "", sampleRequired: "no", consent: false, sourcePage },
  });
  async function submit(data: QuotationInput) {
    setServerError("");
    try { const response = await fetch("/api/quotation", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error); setReference(result.reference); reset();
    } catch (error) { setServerError(error instanceof Error ? error.message : "Unable to submit your inquiry."); }
  }
  if (reference) return <div className="quote-success" role="status"><CheckCircle2/><h3>Inquiry received.</h3><p>Reference: <b>{reference}</b></p><p>Our export team will review your requirements and respond within one business day.</p><button type="button" onClick={() => setReference("")}>Submit another inquiry</button></div>;
  const fieldError = (name: keyof QuotationInput) => errors[name]?.message ? <small className="field-error">{String(errors[name]?.message)}</small> : null;
  return <form className="quote-form" onSubmit={handleSubmit(submit)} noValidate>
    <div className="form-grid">
      <label><span>Company Name *</span><input {...register("companyName")} autoComplete="organization" placeholder="Your company" />{fieldError("companyName")}</label>
      <label><span>Contact Person *</span><input {...register("contactPerson")} autoComplete="name" placeholder="Full name" />{fieldError("contactPerson")}</label>
      <label><span>Business Email *</span><input type="email" {...register("email")} autoComplete="email" placeholder="name@company.com" />{fieldError("email")}</label>
      <label><span>Phone or WhatsApp *</span><input {...register("phone")} autoComplete="tel" placeholder="+00 000 000 000" />{fieldError("phone")}</label>
      <label><span>Country *</span><input {...register("country")} autoComplete="country-name" placeholder="Destination country" />{fieldError("country")}</label>
      <label><span>Company Website</span><input {...register("companyWebsite")} placeholder="https://company.com" /></label>
      <label><span>Product Interested *</span><select {...register("product")}><option value="">Select product</option>{products.map(x=><option key={x.slug}>{x.name}</option>)}</select>{fieldError("product")}</label>
      <label><span>Required Grade *</span><select {...register("grade")}><option value="">Select grade</option><option>Grade A / Gourmet</option><option>Grade B / Extraction</option><option>Custom specification</option><option>To be discussed</option></select>{fieldError("grade")}</label>
      <label><span>Quantity Required *</span><input {...register("quantity")} placeholder="e.g. 100 kg" />{fieldError("quantity")}</label>
      <label><span>Preferred Packaging *</span><select {...register("packaging")}><option value="">Select packaging</option><option>Vacuum-sealed inner packs</option><option>Bulk export carton</option><option>Private label packaging</option><option>Custom specification</option></select>{fieldError("packaging")}</label>
      <label><span>Destination Port *</span><input {...register("destinationPort")} placeholder="City / port / airport" />{fieldError("destinationPort")}</label>
      <label><span>Preferred Incoterm *</span><select {...register("incoterm")}><option value="">Select term</option>{["EXW","FOB","CFR","CIF","DAP"].map(x=><option key={x}>{x}</option>)}</select>{fieldError("incoterm")}</label>
      <label className="full-field"><span>Sample Required *</span><select {...register("sampleRequired")}><option value="no">No, quotation only</option><option value="yes">Yes, subject to approval</option></select></label>
      <label className="full-field"><span>Additional Requirements</span><textarea {...register("notes")} rows={5} placeholder="Target specification, intended application, delivery schedule, or documentation needs" /></label>
      <label className="consent-field full-field"><input type="checkbox" {...register("consent")} /><span>I consent to ALYA Global Trade using these details to respond to my inquiry. *</span>{fieldError("consent")}</label>
      <label className="quote-honeypot" aria-hidden="true"><span>Website</span><input {...register("website")} tabIndex={-1} autoComplete="off" /></label>
      <input type="hidden" {...register("sourcePage")} />
    </div>
    {serverError && <p className="form-error" role="alert">{serverError}</p>}
    <button className="btn btn-gold quote-submit" disabled={isSubmitting}>{isSubmitting ? <><LoaderCircle className="spin" size={17}/> Sending inquiry</> : <>Request a quotation <ArrowRight size={17}/></>}</button>
    <p className="form-note">Your information is used only to review and respond to this B2B export inquiry.</p>
  </form>;
}
