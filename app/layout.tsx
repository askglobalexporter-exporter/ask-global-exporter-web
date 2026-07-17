import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { AnalyticsBeacon } from "@/components/AnalyticsBeacon";
import { CompanySettingsProvider } from "@/components/CompanySettingsProvider";
import { getCompanySettings, getSeoSetting } from "@/lib/public-content";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });
const cormorant = Cormorant_Garamond({ variable: "--font-display", subsets: ["latin"], weight: ["500", "600"], display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const [seo, company] = await Promise.all([getSeoSetting("/"), getCompanySettings()]);
  const title = seo?.meta_title ?? `${company.brand_name} — Premium Indonesian Commodities`;
  const description = seo?.meta_description ?? company.description;
  const image = seo?.og_image_url ?? "/og.jpg";
  return { metadataBase:new URL("https://www.askglobalexport.com"),title:{default:title,template:`%s | ${company.brand_name}`},description,keywords:seo?.keywords ?? ["Indonesian Trading Company","Agricultural Commodities","Plantation Products","Indonesian Spices","Natural Ingredients","Private Label","Global Trading"],alternates:{canonical:seo?.canonical_url ?? "/"},robots:seo?.robots ?? "index,follow",openGraph:{title,description,type:"website",locale:"en_US",url:"https://www.askglobalexport.com",siteName:company.brand_name,images:[{url:image,alt:title,width:1200,height:630}]},twitter:{card:"summary_large_image",title,description,images:[image]},icons:{icon:company.logo_url || "/favicon.svg"} };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const company = await getCompanySettings();
  const schema = { "@context": "https://schema.org", "@type": "Organization", name: company.legal_name, url: "https://www.askglobalexport.com", description: company.description, email: company.email, telephone: company.whatsapp_display, logo: company.logo_url || undefined, areaServed: "Worldwide", address: { "@type": "PostalAddress", streetAddress: company.address, addressCountry: "ID" } };
  return <html lang="en" className={`${manrope.variable} ${cormorant.variable}`}><body><CompanySettingsProvider settings={company}>{children}</CompanySettingsProvider><AnalyticsBeacon /><script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}} /></body></html>;
}
