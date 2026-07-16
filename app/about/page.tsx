import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Globe2, ShieldCheck, Users } from "lucide-react";
import { Header } from "@/components/Header";
import { getPublishedCmsEntries, getSeoSetting } from "@/lib/public-content";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSetting("/about");
  const title = seo?.meta_title || "About Ask Global";
  const description = seo?.meta_description || "Meet Ask Global, an Indonesian trading company connecting global buyers with dependable commodity sourcing partners.";
  return { title, description, alternates:{canonical:seo?.canonical_url || "/about"}, openGraph:{title,description,images:[seo?.og_image_url || "/og.jpg"]} };
}

export default async function AboutPage() {
  const [aboutEntries, profileEntries, testimonials] = await Promise.all([
    getPublishedCmsEntries("about"),
    getPublishedCmsEntries("company_profile"),
    getPublishedCmsEntries("testimonial"),
  ]);
  const overview = aboutEntries.find((entry)=>entry.slug === "company-overview") ?? aboutEntries[0];
  const principle = profileEntries.find((entry)=>entry.slug === "company-principle") ?? profileEntries[0];
  return <main className="editorial-page"><div className="detail-header-wrap"><Header/></div>
    <section className="editorial-hero"><div className="shell editorial-hero-grid"><div><div className="eyebrow"><span/> Indonesian sourcing partner</div><h1>{overview?.title || "Trade built on trust, consistency, and execution."}</h1><p>{overview?.excerpt || "ASK Global connects global buyers with premium Indonesian commodities through transparent commercial coordination."}</p><Link className="btn btn-gold" href="/products/vanilla-beans#quotation">Start a sourcing conversation <ArrowRight size={16}/></Link></div><div className="editorial-hero-image"><Image src={overview?.featured_image_url || "/hero-vanilla.webp"} alt="Ask Global Indonesian commodity sourcing" fill priority sizes="(max-width:900px) 100vw,45vw"/></div></div></section>
    <section className="editorial-body shell"><div className="section-label">Who we are</div><div className="editorial-two-col"><h2>{principle?.title || "Long-term partnerships are earned."}</h2><div>{[overview?.content?.body,principle?.excerpt,principle?.content?.body].filter(Boolean).map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div></div>
      <div className="editorial-values">{[[ShieldCheck,"Consistency","Specification-led sourcing and repeatable quality expectations."],[Globe2,"Transparency","Clear communication on availability, documentation, and commercial terms."],[Users,"Reliable execution","Coordination across suppliers, processors, buyers, and freight partners."]].map(([Icon,title,copy])=><article key={title as string}><Icon size={25}/><h3>{title as string}</h3><p>{copy as string}</p><span><Check size={14}/> Built for B2B buyers</span></article>)}</div>
    </section>
    {testimonials.length>0 && <section className="editorial-testimonials"><div className="shell"><div className="section-label light">Partner feedback</div><div className="testimonial-grid">{testimonials.map((entry)=><blockquote key={entry.id}><p>{entry.content?.body || entry.excerpt}</p><footer><b>{entry.content?.author || entry.title}</b><span>{[entry.content?.role,entry.content?.company].filter(Boolean).join(" · ")}</span></footer></blockquote>)}</div></div></section>}
  </main>;
}
