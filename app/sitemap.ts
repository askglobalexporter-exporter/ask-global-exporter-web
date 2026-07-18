import type { MetadataRoute } from "next";
import { getPublishedCmsEntries, getPublishedProducts } from "@/lib/public-content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://www.askglobalexport.com";
  const [products,posts]=await Promise.all([getPublishedProducts(),getPublishedCmsEntries("blog")]);
  return [
    {url:base,changeFrequency:"weekly",priority:1},
    {url:`${base}/about`,changeFrequency:"monthly",priority:.8},
    {url:`${base}/privacy`,changeFrequency:"yearly",priority:.3},
    {url:`${base}/testimonials`,changeFrequency:"monthly",priority:.6},
    {url:`${base}/products/vanilla-beans`,changeFrequency:"weekly",priority:1},
    {url:`${base}/blog`,changeFrequency:"weekly",priority:.7},
    ...products.map((product)=>({url:`${base}/products/${product.slug}`,changeFrequency:"monthly" as const,priority:.75})),
    ...posts.map((post)=>({url:`${base}/blog/${post.slug}`,lastModified:post.updated_at,changeFrequency:"monthly" as const,priority:.6})),
  ];
}
