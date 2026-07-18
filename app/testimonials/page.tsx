import type { Metadata } from "next";
import { Quote } from "lucide-react";
import { Header } from "@/components/Header";
import { TestimonialForm } from "@/components/TestimonialForm";
import { getPublishedCmsEntries } from "@/lib/public-content";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Buyer Testimonials",
  description: "Read verified buyer feedback or submit your experience working with Ask Global.",
  alternates: { canonical:"/testimonials" },
};

export default async function TestimonialsPage() {
  const testimonials = await getPublishedCmsEntries("testimonial");
  return <main className="editorial-page testimonial-page">
    <div className="detail-header-wrap"><Header/></div>
    <section className="testimonial-public-hero shell"><div className="eyebrow"><span/> Buyer feedback</div><h1>Experiences built on<br/><em>reliable execution.</em></h1><p>Published feedback is reviewed before it appears publicly. Buyers who have worked with Ask Global can share their experience below.</p></section>
    {testimonials.length > 0 && <section className="testimonial-public-list shell"><div className="section-label">Published testimonials</div><div className="testimonial-grid">{testimonials.map((entry)=><blockquote key={entry.id}><Quote size={24}/><p>{entry.content?.body || entry.excerpt}</p><footer><b>{entry.content?.author || entry.title}</b><span>{[entry.content?.role,entry.content?.company].filter(Boolean).join(" · ")}</span></footer></blockquote>)}</div></section>}
    <section className="testimonial-submit-section"><div className="shell testimonial-submit-grid"><div><div className="section-label light">Share your experience</div><h2>Your feedback<br/><em>matters.</em></h2><p>Every submission is reviewed by our team. Nothing is published automatically without approval.</p></div><TestimonialForm/></div></section>
  </main>;
}
