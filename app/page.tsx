import { HomePage } from "@/components/HomePage";
import { getHomepageSectionConfig, getPublishedCmsEntries, getPublishedProducts } from "@/lib/public-content";

export const revalidate = 300;

export default async function Home() {
  const [catalog, sections, about, companyProfile, faqs, testimonials, blog, exportDocuments] = await Promise.all([
    getPublishedProducts(),
    getHomepageSectionConfig(),
    getPublishedCmsEntries("about"),
    getPublishedCmsEntries("company_profile"),
    getPublishedCmsEntries("faq"),
    getPublishedCmsEntries("testimonial"),
    getPublishedCmsEntries("blog"),
    getPublishedCmsEntries("export_document"),
  ]);
  const sectionConfig = Object.fromEntries(sections.map((section) => [section.section_key, section]));
  return <HomePage catalog={catalog} sectionConfig={sectionConfig} content={{ about, companyProfile, faqs, testimonials, blog, exportDocuments }} />;
}
