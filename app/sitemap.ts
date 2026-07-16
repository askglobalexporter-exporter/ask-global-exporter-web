import type { MetadataRoute } from "next";
import { products } from "@/data/products";
export default function sitemap(): MetadataRoute.Sitemap { const base = "https://ask-global-exporter-web.vercel.app"; return [{ url: base, changeFrequency: "monthly", priority: 1 }, { url: `${base}/products/vanilla-beans`, changeFrequency: "weekly", priority: 1 }, ...products.map(p => ({ url: `${base}/products/${p.slug}`, changeFrequency: "monthly" as const, priority: .7 }))]; }
