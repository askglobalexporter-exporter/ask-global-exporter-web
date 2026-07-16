import { HomePage } from "@/components/HomePage";
import { getHomepageSectionConfig, getPublishedProducts } from "@/lib/public-content";

export const revalidate = 300;

export default async function Home() {
  const [catalog, sections] = await Promise.all([getPublishedProducts(), getHomepageSectionConfig()]);
  const sectionConfig = Object.fromEntries(sections.map((section) => [section.section_key, section]));
  return <HomePage catalog={catalog} sectionConfig={sectionConfig} />;
}
