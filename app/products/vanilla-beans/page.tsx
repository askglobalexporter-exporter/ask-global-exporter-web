import type { Metadata } from "next";
import { VanillaExportPage } from "@/components/VanillaExportPage";
import { cmsFaqs, getPublishedCmsEntries, getPublishedProducts, getSeoSetting } from "@/lib/public-content";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSetting("/products/vanilla-beans");
  const title = seo?.meta_title || "Indonesian Vanilla Beans Exporter & Wholesale Supplier";
  const description = seo?.meta_description || "Source Indonesian Vanilla planifolia for B2B requirements. Grade A, extraction beans and processed formats with specifications confirmed per lot and export support.";
  return { title,description,keywords:seo?.keywords || ["Indonesian vanilla beans","vanilla bean exporter","bulk vanilla supplier"],alternates:{canonical:seo?.canonical_url || "/products/vanilla-beans"},openGraph:{title,description,images:[seo?.og_image_url || "/hero-vanilla.webp"]} };
}

export default async function VanillaBeansPage() {
  const [catalog,faqEntries,documentEntries]=await Promise.all([getPublishedProducts(),getPublishedCmsEntries("faq"),getPublishedCmsEntries("export_document")]);
  return <VanillaExportPage catalog={catalog} faqItems={cmsFaqs(faqEntries)} documentNames={documentEntries.map((entry)=>entry.title)} />;
}
