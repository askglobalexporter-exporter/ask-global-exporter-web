import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { getPublishedCmsEntries, getSeoSetting } from "@/lib/public-content";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSetting("/blog");
  const title = seo?.meta_title || "Trade Insights";
  const description = seo?.meta_description || "Sourcing, product, and export insights from Ask Global.";
  return { title,description,alternates:{canonical:seo?.canonical_url || "/blog"},openGraph:{title,description,images:[seo?.og_image_url || "/og.jpg"]} };
}

export default async function BlogPage() {
  const posts = await getPublishedCmsEntries("blog");
  return <main className="editorial-page"><div className="detail-header-wrap"><Header/></div><section className="blog-index-hero"><div className="shell"><div className="eyebrow"><span/> Ask Global insights</div><h1>Practical context for<br/><em>global sourcing.</em></h1><p>Updates on Indonesian commodities, specification-led buying, and export readiness.</p></div></section><section className="shell blog-index-grid">{posts.length ? posts.map((post)=><article key={post.id}>{post.featured_image_url && <Link className="blog-card-image" href={`/blog/${post.slug}`}><Image src={post.featured_image_url} alt={post.title} fill sizes="(max-width:800px) 100vw,33vw"/></Link>}<small>{post.published_at ? new Date(post.published_at).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}) : "Ask Global"}</small><h2><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2><p>{post.excerpt}</p><Link className="text-link" href={`/blog/${post.slug}`}>Read article <ArrowRight size={14}/></Link></article>) : <div className="public-empty"><h2>Insights are being prepared.</h2><p>Published articles will appear here.</p></div>}</section></main>;
}
