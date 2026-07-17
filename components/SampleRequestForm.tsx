"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { sampleSchema, type SampleInput } from "@/lib/inquiry-validation";
import { products } from "@/data/products";
import { TurnstileField } from "./TurnstileField";

export function SampleRequestForm({ product, grade, sourcePage = "/products" }: { product?: string; grade?: string; sourcePage?: string }) {
  const [reference, setReference] = useState(""); const [serverError, setServerError] = useState(""); const [turnstileResetKey,setTurnstileResetKey]=useState(0);
  const { register, handleSubmit, reset, setValue, formState:{ errors, isSubmitting } } = useForm<SampleInput>({ resolver:zodResolver(sampleSchema), defaultValues:{ product:product||"", grade:grade||"", consent:false, sourcePage, turnstileToken:"" } });
  async function submit(data:SampleInput){setServerError("");try{const response=await fetch("/api/sample",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});const result=await response.json();if(!response.ok)throw new Error(result.error);setReference(result.reference);reset();}catch(error){setServerError(error instanceof Error?error.message:"Unable to submit your request.");}finally{setValue("turnstileToken","");setTurnstileResetKey((value)=>value+1);}}
  if(reference)return <div className="quote-success" role="status"><CheckCircle2/><h3>Sample request received.</h3><p>Reference: <b>{reference}</b></p><p>Availability is subject to approval. Shipping fees may apply, and specifications will be confirmed before dispatch.</p><button type="button" onClick={()=>setReference("")}>Submit another request</button></div>;
  const fieldError=(name:keyof SampleInput)=>errors[name]?.message?<small className="field-error">{String(errors[name]?.message)}</small>:null;
  return <form className="quote-form" onSubmit={handleSubmit(submit)} noValidate><div className="form-grid">
    <label><span>Company Name *</span><input {...register("companyName")} />{fieldError("companyName")}</label><label><span>Contact Person *</span><input {...register("contactPerson")} />{fieldError("contactPerson")}</label>
    <label><span>Business Email *</span><input type="email" {...register("email")} />{fieldError("email")}</label><label><span>Country *</span><input {...register("country")} />{fieldError("country")}</label>
    <label><span>Product *</span><select {...register("product")}><option value="">Select product</option>{products.map(x=><option key={x.slug}>{x.name}</option>)}</select>{fieldError("product")}</label>
    <label><span>Required Grade *</span><input {...register("grade")} placeholder="Grade or specification" />{fieldError("grade")}</label>
    <label className="full-field"><span>Intended Use *</span><input {...register("intendedUse")} placeholder="Extraction, food manufacturing, retail, etc." />{fieldError("intendedUse")}</label>
    <label className="full-field"><span>Expected Future Order Volume *</span><input {...register("expectedVolume")} placeholder="Estimated volume and frequency" />{fieldError("expectedVolume")}</label>
    <label className="full-field"><span>Shipping Address *</span><textarea rows={4} {...register("shippingAddress")} />{fieldError("shippingAddress")}</label>
    <label className="full-field"><span>Courier Account</span><input {...register("courierAccount")} placeholder="Optional DHL / FedEx / UPS account" /></label>
    <label className="full-field"><span>Additional Notes</span><textarea rows={4} {...register("notes")} /></label>
    <label className="consent-field full-field"><input type="checkbox" {...register("consent")} /><span>I understand samples are subject to approval and shipping fees may apply. *</span>{fieldError("consent")}</label>
    <label className="quote-honeypot" aria-hidden="true"><input {...register("website")} tabIndex={-1}/></label><input type="hidden" {...register("sourcePage")}/><input type="hidden" {...register("turnstileToken")}/><TurnstileField onToken={(token)=>setValue("turnstileToken",token)} resetKey={turnstileResetKey}/>
  </div>{serverError&&<p className="form-error" role="alert">{serverError}</p>}<button className="btn btn-gold quote-submit" disabled={isSubmitting}>{isSubmitting?<><LoaderCircle className="spin" size={17}/> Sending request</>:<>Request a sample <ArrowRight size={17}/></>}</button><p className="form-note">Sample availability is subject to approval. See our <Link href="/privacy">Privacy Policy</Link>.</p></form>;
}
