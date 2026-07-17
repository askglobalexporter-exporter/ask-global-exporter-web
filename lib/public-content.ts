import { createClient } from "@supabase/supabase-js";
import { products as fallbackProducts, type Product, type ProductFaq } from "@/data/products";
import { getSupabasePublishableKey, getSupabaseUrl, hasSupabaseBrowserConfig } from "@/lib/supabase/env";

let client: ReturnType<typeof createClient> | null | undefined;

function publicClient() {
  if (client !== undefined) return client;
  if (!hasSupabaseBrowserConfig()) return (client = null);
  client = createClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

export type CmsContent = {
  title?: string;
  eyebrow?: string;
  summary?: string;
  body?: string;
  cta_label?: string;
  cta_url?: string;
  question?: string;
  answer?: string;
  author?: string;
  company?: string;
  role?: string;
  image_url?: string;
};

export type CmsEntry = {
  id: string;
  collection: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: CmsContent;
  featured_image_url: string | null;
  published_at: string | null;
  updated_at: string;
};

export type HomepageSection = {
  section_key: string;
  label: string;
  position: number;
  is_visible: boolean;
  content: CmsContent;
};

export type SeoSetting = {
  route:string;
  meta_title:string|null;
  meta_description:string|null;
  canonical_url:string|null;
  keywords:string[]|null;
  og_image_url:string|null;
  robots:string|null;
};

export type CompanySettings = {
  brand_name: string;
  legal_name: string;
  tagline: string;
  description: string;
  email: string;
  whatsapp_number: string;
  whatsapp_display: string;
  address: string;
  service_area: string;
  business_hours: string;
  logo_url: string | null;
  whatsapp_logo_url: string | null;
};

export const defaultCompanySettings: CompanySettings = {
  brand_name: "Ask Global",
  legal_name: "ASK Global",
  tagline: "Indonesian commodities · Global trading",
  description: "Connecting global buyers with premium Indonesian commodities through consistent, transparent, and reliable trade.",
  email: "askglobalexporter@gmail.com",
  whatsapp_number: "6285196598995",
  whatsapp_display: "+62 851-9659-8995",
  address: "Jakarta, Indonesia",
  service_area: "Serving buyers worldwide",
  business_hours: "Mon–Fri, 09:00–17:00 WIB",
  logo_url: null,
  whatsapp_logo_url: null,
};

type DbProductImage = { image_url: string; alt_text: string | null; position: number };
type DbProduct = {
  slug: string; name: string; category: string; short_description: string; description: string;
  origin: string; moq: string | null; primary_image_url: string | null; grades: unknown;
  specifications: unknown; packaging_options: unknown; lead_time: string | null; incoterms: string[];
  seo_title: string | null; seo_description: string | null; is_featured: boolean;
  product_images?: DbProductImage[];
};

function asStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function asSpecs(value: unknown): Array<{ label: string; value: string }> {
  return Array.isArray(value)
    ? value.filter((item): item is { label: string; value: string } => Boolean(item && typeof item === "object" && "label" in item && "value" in item))
    : [];
}

function mapProduct(item: DbProduct): Product {
  const fallback = fallbackProducts.find((product) => product.slug === item.slug);
  const image = item.primary_image_url || fallback?.image || "/hero-vanilla.webp";
  const specifications = asSpecs(item.specifications);
  const grades = asStrings(item.grades);
  const packaging = asStrings(item.packaging_options);
  const gallery = (item.product_images ?? [])
    .sort((a, b) => a.position - b.position)
    .map((entry) => entry.image_url)
    .filter(Boolean);
  if (!gallery.includes(image)) gallery.unshift(image);
  for (const fallbackImage of fallback?.gallery ?? []) {
    if (gallery.length >= 3) break;
    if (!gallery.includes(fallbackImage)) gallery.push(fallbackImage);
  }

  return {
    slug: item.slug,
    name: item.name,
    shortName: item.name,
    category: item.category,
    origin: item.origin,
    moq: item.moq || "Available upon request",
    shortDescription: item.short_description || undefined,
    description: item.description || item.short_description,
    image,
    gallery: gallery.length ? gallery : [image],
    grade: grades[0] || "Confirmed per lot",
    grades,
    typicalLength: specifications.find((row) => row.label.toLowerCase().includes("length"))?.value || "To be confirmed",
    moisture: specifications.find((row) => row.label.toLowerCase().includes("moisture"))?.value || "Confirmed per lot",
    application: specifications.find((row) => row.label.toLowerCase().includes("application"))?.value || "B2B ingredient applications",
    packaging: packaging.length ? packaging : ["Export packaging confirmed with quotation"],
    leadTime: item.lead_time || "Confirmed with quotation",
    shipping: item.incoterms?.join(", ") || "International air and sea freight",
    incoterms: item.incoterms ?? [],
    monthlyCapacity: "Available upon request",
    specifications: specifications.length ? specifications : fallback?.specifications ?? [],
    faqs: fallback?.faqs ?? [],
    seoTitle: item.seo_title || item.name,
    seoDescription: item.seo_description || item.short_description || item.description,
    isFeatured: item.is_featured,
  };
}

const productSelect = "*,product_images(image_url,alt_text,position)";

export async function getPublishedProducts(): Promise<Product[]> {
  const supabase = publicClient();
  if (!supabase) return fallbackProducts;
  const { data, error } = await supabase.from("products").select(productSelect).eq("status", "published").order("position");
  if (error) {
    console.error("Unable to load published products", error.message);
    return [];
  }
  return (data as unknown as DbProduct[]).map(mapProduct).sort((a,b)=>Number(Boolean(b.isFeatured))-Number(Boolean(a.isFeatured)));
}

export async function getPublishedProduct(slug: string): Promise<Product | undefined> {
  const supabase = publicClient();
  if (!supabase) return fallbackProducts.find((product) => product.slug === slug);
  const { data, error } = await supabase.from("products").select(productSelect).eq("slug", slug).eq("status", "published").maybeSingle();
  if (error) console.error("Unable to load published product", error.message);
  return data ? mapProduct(data as unknown as DbProduct) : undefined;
}

export async function getHomepageSectionConfig(): Promise<HomepageSection[]> {
  const supabase = publicClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("homepage_sections").select("section_key,label,position,is_visible,content").order("position");
  if (error) console.error("Unable to load homepage layout", error.message);
  return (data ?? []) as HomepageSection[];
}

export async function getPublishedCmsEntries(collection: string): Promise<CmsEntry[]> {
  const supabase = publicClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("cms_entries").select("id,collection,slug,title,excerpt,content,featured_image_url,published_at,updated_at").eq("collection", collection).eq("status", "published").order("published_at", { ascending: false });
  if (error) console.error(`Unable to load ${collection} content`, error.message);
  return (data ?? []) as CmsEntry[];
}

export async function getPublishedCmsEntry(collection: string, slug: string): Promise<CmsEntry | null> {
  const supabase = publicClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("cms_entries").select("id,collection,slug,title,excerpt,content,featured_image_url,published_at,updated_at").eq("collection", collection).eq("slug", slug).eq("status", "published").maybeSingle();
  if (error) console.error(`Unable to load ${collection}/${slug}`, error.message);
  return data as CmsEntry | null;
}

export function cmsFaqs(entries: CmsEntry[]): ProductFaq[] {
  return entries.map((entry) => ({
    question: entry.content?.question || entry.title,
    answer: entry.content?.answer || entry.content?.body || entry.excerpt || "",
  })).filter((item) => item.question && item.answer);
}

export async function getSeoSetting(route: string): Promise<SeoSetting | null> {
  const supabase = publicClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("seo_settings").select("*").eq("route", route).maybeSingle();
  if (error) console.error(`Unable to load SEO for ${route}`, error.message);
  return data as SeoSetting | null;
}

export async function getCompanySettings(): Promise<CompanySettings> {
  const supabase = publicClient();
  if (!supabase) return defaultCompanySettings;
  const { data, error } = await supabase.from("company_settings").select("brand_name,legal_name,tagline,description,email,whatsapp_number,whatsapp_display,address,service_area,business_hours,logo_url,whatsapp_logo_url").eq("singleton", true).maybeSingle();
  if (error) {
    console.error("Unable to load company settings", error.message);
    return defaultCompanySettings;
  }
  return data ? { ...defaultCompanySettings, ...(data as CompanySettings) } : defaultCompanySettings;
}
