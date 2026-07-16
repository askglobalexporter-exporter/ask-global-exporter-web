import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { AnalyticsBeacon } from "@/components/AnalyticsBeacon";
import { getSeoSetting } from "@/lib/public-content";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });
const cormorant = Cormorant_Garamond({ variable: "--font-display", subsets: ["latin"], weight: ["500", "600"], display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSetting("/");
  const title = seo?.meta_title ?? "Ask Global — Premium Indonesian Commodities";
  const description = seo?.meta_description ?? "Ask Global connects global buyers with premium Indonesian agricultural commodities, plantation products, spices, natural ingredients, and private-label supply.";
  const image = seo?.og_image_url ?? "/og.jpg";
  return { metadataBase:new URL("https://www.askglobalexport.com"),title:{default:title,template:"%s | Ask Global"},description,keywords:seo?.keywords ?? ["Indonesian Trading Company","Agricultural Commodities","Plantation Products","Indonesian Spices","Natural Ingredients","Private Label","Global Trading"],alternates:{canonical:seo?.canonical_url ?? "/"},robots:seo?.robots ?? "index,follow",openGraph:{title,description,type:"website",locale:"en_US",url:"https://www.askglobalexport.com",siteName:"Ask Global",images:[{url:image,alt:title,width:1200,height:630}]},twitter:{card:"summary_large_image",title,description,images:[image]},icons:{icon:"/favicon.svg"} };
}

const schema = { "@context": "https://schema.org", "@type": "Organization", name: "Ask Global", url: "https://www.askglobalexport.com", description: "Indonesian trading company connecting global buyers with premium Indonesian commodities", email: "askglobalexporter@gmail.com", telephone: "+62-851-9659-8995", areaServed: "Worldwide", address: { "@type": "PostalAddress", addressLocality: "Jakarta", addressCountry: "ID" } };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${manrope.variable} ${cormorant.variable}`}><body>{children}<AnalyticsBeacon /><script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}} /></body></html>;
}
