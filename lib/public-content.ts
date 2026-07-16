import { createClient } from "@supabase/supabase-js";
import { products as fallbackProducts, type Product } from "@/data/products";
import { getSupabasePublishableKey, getSupabaseUrl, hasSupabaseBrowserConfig } from "@/lib/supabase/env";

function publicClient() {
  if (!hasSupabaseBrowserConfig()) return null;
  return createClient(getSupabaseUrl(), getSupabasePublishableKey(), { auth:{persistSession:false,autoRefreshToken:false} });
}

type DbProduct = { slug:string;name:string;category:string;short_description:string;description:string;origin:string;moq:string|null;primary_image_url:string|null;grades:unknown;specifications:unknown;packaging_options:unknown;lead_time:string|null;incoterms:string[];seo_title:string|null;seo_description:string|null };
function asStrings(value: unknown): string[] { return Array.isArray(value) ? value.map(String) : []; }
function asSpecs(value: unknown): Array<{label:string;value:string}> { return Array.isArray(value) ? value.filter((item): item is {label:string;value:string} => Boolean(item && typeof item === "object" && "label" in item && "value" in item)) : []; }
function mapProduct(item: DbProduct): Product {
  const fallback = fallbackProducts.find((product) => product.slug === item.slug);
  const image = item.primary_image_url || fallback?.image || "/hero-vanilla.webp";
  const specifications = asSpecs(item.specifications);
  const grades = asStrings(item.grades); const packaging = asStrings(item.packaging_options);
  return { slug:item.slug,name:item.name,shortName:item.name,category:item.category,origin:item.origin,moq:item.moq || "Available upon request",description:item.short_description || item.description,image,gallery:fallback?.gallery ?? [image],grade:grades[0] || "Confirmed per lot",typicalLength:specifications.find((row)=>row.label.toLowerCase().includes("length"))?.value || "To be confirmed",moisture:specifications.find((row)=>row.label.toLowerCase().includes("moisture"))?.value || "Confirmed per lot",application:specifications.find((row)=>row.label.toLowerCase().includes("application"))?.value || "B2B ingredient applications",packaging:packaging.length ? packaging : ["Export packaging confirmed with quotation"],leadTime:item.lead_time || "Confirmed with quotation",shipping:item.incoterms?.join(", ") || "International air and sea freight",monthlyCapacity:"Available upon request",specifications:specifications.length ? specifications : fallback?.specifications ?? [],faqs:fallback?.faqs ?? [],seoTitle:item.seo_title || item.name,seoDescription:item.seo_description || item.short_description || item.description };
}

export async function getPublishedProducts() {
  const supabase = publicClient(); if (!supabase) return fallbackProducts;
  const { data, error } = await supabase.from("products").select("*").eq("status","published").order("position");
  if (error || !data?.length) return fallbackProducts;
  return (data as DbProduct[]).map(mapProduct);
}

export async function getPublishedProduct(slug: string) {
  const supabase = publicClient(); if (supabase) { const { data } = await supabase.from("products").select("*").eq("slug",slug).eq("status","published").maybeSingle(); if (data) return mapProduct(data as DbProduct); }
  return fallbackProducts.find((product) => product.slug === slug);
}

export async function getHomepageSectionConfig() {
  const supabase = publicClient(); if (!supabase) return [];
  const { data } = await supabase.from("homepage_sections").select("section_key,position,is_visible").order("position");
  return data ?? [];
}

export async function getSeoSetting(route: string) {
  const supabase = publicClient(); if (!supabase) return null;
  const { data } = await supabase.from("seo_settings").select("*").eq("route",route).maybeSingle();
  return data;
}
