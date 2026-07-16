import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { getPublishedCmsEntries, getPublishedCmsEntry } from "@/lib/public-content";

export const revalidate = 300;

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata> {
  const post = await getPublishedCmsEntry("blog",(await params).slug);
  if (!post) return {};
  return {title:post.title,description:post.excerpt || post.content?.body?.slice(0,155),alternates:{canonical:`/blog/${post.slug}`},openGraph:{title:post.title,description:post.excerpt || "",images:post.featured_image_url?[post.featured_image_url]:["/og.jpg"],type:"article"}};
}

export default async function BlogArticlePage({params}:{params:Promise<{slug:string}>}) {
  const slug=(await params).slug;
  const [post,posts]=await Promise.all([getPublishedCmsEntry("blog",slug),getPublishedCmsEntries("blog")]);
  if(!post) notFound();
  const related=posts.filter((entry)=>entry.slug!==slug).slice(0,3);
  return <main className="editorial-page"><div className="detail-header-wrap"><Header/></div><article className="article-page"><header className="shell"><Link href="/blog" className="back-link"><ArrowLeft size={15}/> All insights</Link><small>{post.published_at ? new Date(post.published_at).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}) : "Ask Global"}</small><h1>{post.title}</h1><p>{post.excerpt}</p></header>{post.featured_image_url && <div className="article-cover shell"><Image src={post.featured_image_url} alt={post.title} fill priority sizes="(max-width:1000px) 100vw,1000px"/></div>}<div className="article-copy shell">{(post.content?.body || "").split(/\n\s*\n/).filter(Boolean).map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div></article>{related.length>0 && <section className="related-articles shell"><div className="section-heading"><h2>More trade insights.</h2><Link href="/blog" className="text-link">View all <ArrowRight size={14}/></Link></div><div className="blog-index-grid">{related.map((entry)=><article key={entry.id}><small>Ask Global</small><h3><Link href={`/blog/${entry.slug}`}>{entry.title}</Link></h3><p>{entry.excerpt}</p></article>)}</div></section>}</main>;
}
