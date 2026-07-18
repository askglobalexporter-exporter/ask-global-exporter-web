"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { testimonialSchema, type TestimonialInput } from "@/lib/inquiry-validation";
import { TurnstileField } from "./TurnstileField";

export function TestimonialForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const { register, handleSubmit, reset, setValue, formState:{ errors, isSubmitting } } = useForm<TestimonialInput>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: { name:"", company:"", role:"", testimonial:"", consent:false, website:"", turnstileToken:"" },
  });

  async function submit(data: TestimonialInput) {
    setServerError("");
    try {
      const response = await fetch("/api/testimonials", { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      reset();
      setSubmitted(true);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Unable to submit your testimonial.");
    } finally {
      setValue("turnstileToken", "");
      setTurnstileResetKey((value)=>value+1);
    }
  }

  if (submitted) return <div className="quote-success" role="status"><CheckCircle2/><h3>Thank you for sharing.</h3><p>Your testimonial has been received and will be reviewed before publication.</p><button type="button" onClick={()=>setSubmitted(false)}>Submit another testimonial</button></div>;
  const fieldError = (name:keyof TestimonialInput) => errors[name]?.message ? <small className="field-error">{String(errors[name]?.message)}</small> : null;
  return <form className="quote-form testimonial-form" onSubmit={handleSubmit(submit)} noValidate>
    <div className="form-grid">
      <label><span>Your name *</span><input {...register("name")} autoComplete="name" placeholder="Full name" />{fieldError("name")}</label>
      <label><span>Company *</span><input {...register("company")} autoComplete="organization" placeholder="Company name" />{fieldError("company")}</label>
      <label className="full-field"><span>Role or position</span><input {...register("role")} autoComplete="organization-title" placeholder="e.g. Purchasing Manager" />{fieldError("role")}</label>
      <label className="full-field"><span>Your testimonial *</span><textarea {...register("testimonial")} rows={7} placeholder="Tell us about your sourcing or business experience with Ask Global." />{fieldError("testimonial")}</label>
      <label className="consent-field full-field"><input type="checkbox" {...register("consent")} /><span>I confirm this testimonial is genuine and consent to Ask Global publishing my name, company, role, and testimonial on its website. *</span>{fieldError("consent")}</label>
      <label className="quote-honeypot" aria-hidden="true"><span>Website</span><input {...register("website")} tabIndex={-1} autoComplete="off" /></label>
      <input type="hidden" {...register("turnstileToken")} />
      <TurnstileField onToken={(token)=>setValue("turnstileToken", token)} resetKey={turnstileResetKey}/>
    </div>
    {serverError && <p className="form-error" role="alert">{serverError}</p>}
    <button className="btn btn-gold quote-submit" disabled={isSubmitting}>{isSubmitting ? <><LoaderCircle className="spin" size={17}/> Sending</> : <>Submit testimonial <ArrowRight size={17}/></>}</button>
    <p className="form-note">Submissions are reviewed before publication. See our <Link href="/privacy">Privacy Policy</Link>.</p>
  </form>;
}
