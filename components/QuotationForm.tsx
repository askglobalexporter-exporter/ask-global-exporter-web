"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";

type Status = "idle" | "submitting" | "success" | "error";

export function QuotationForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch("/api/quotation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to submit your inquiry.");
      form.reset();
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to submit your inquiry.");
    }
  }

  if (status === "success") {
    return <div className="quote-success" role="status">
      <CheckCircle2 />
      <h3>Inquiry received.</h3>
      <p>Thank you. Our export team will review your requirements and contact you within one business day.</p>
      <button type="button" onClick={() => setStatus("idle")}>Submit another inquiry</button>
    </div>;
  }

  return <form className="quote-form" onSubmit={submit}>
    <div className="form-grid">
      <label><span>Company Name *</span><input name="companyName" required maxLength={120} autoComplete="organization" placeholder="Your company" /></label>
      <label><span>Contact Person *</span><input name="contactPerson" required maxLength={100} autoComplete="name" placeholder="Full name" /></label>
      <label><span>Email Address *</span><input type="email" name="email" required maxLength={160} autoComplete="email" placeholder="name@company.com" /></label>
      <label><span>Country *</span><input name="country" required maxLength={80} autoComplete="country-name" placeholder="Destination country" /></label>
      <label><span>Quantity Required *</span><input name="quantity" required maxLength={80} placeholder="e.g. 100 kg" /></label>
      <label><span>Packaging Requirement</span><select name="packaging"><option value="">Select packaging</option><option>1 kg vacuum pack</option><option>5 kg vacuum pack</option><option>10 kg bulk carton</option><option>Custom packaging</option></select></label>
      <label className="full-field"><span>Incoterm</span><select name="incoterm"><option value="">Select preferred term</option><option>EXW</option><option>FOB</option><option>CIF</option><option>CFR</option><option>DAP</option></select></label>
      <label className="full-field"><span>Additional Notes</span><textarea name="notes" rows={5} maxLength={1500} placeholder="Grade, bean length, moisture, target delivery date, or other requirements" /></label>
      <label className="quote-honeypot" aria-hidden="true"><span>Website</span><input name="website" tabIndex={-1} autoComplete="off" /></label>
    </div>
    {status === "error" && <p className="form-error" role="alert">{message}</p>}
    <button className="btn btn-gold quote-submit" disabled={status === "submitting"}>
      {status === "submitting" ? <><LoaderCircle className="spin" size={17} /> Sending inquiry</> : <>Request quotation <ArrowRight size={17} /></>}
    </button>
    <p className="form-note">Your information is used only to prepare and respond to this export inquiry.</p>
  </form>;
}
