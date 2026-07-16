import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });
const cormorant = Cormorant_Garamond({ variable: "--font-display", subsets: ["latin"], weight: ["500", "600"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://ask-global-exporter-web.vercel.app"),
  title: { default: "Ask Global — Premium Indonesian Commodities", template: "%s | Ask Global" },
  description: "Ask Global connects global buyers with premium Indonesian agricultural commodities, plantation products, spices, natural ingredients, and private-label supply.",
  keywords: ["Indonesian Trading Company", "Agricultural Commodities", "Plantation Products", "Indonesian Spices", "Natural Ingredients", "Private Label", "Global Trading"],
  openGraph: { title: "Ask Global", description: "Premium Indonesian Commodities for Global Buyers", type: "website", locale: "en_US", images: [{ url: "/hero-vanilla.png", width: 1536, height: 1024, alt: "Ask Global — Premium Indonesian Commodities" }] },
  twitter: { card: "summary_large_image", title: "Ask Global", description: "Premium Indonesian Commodities for Global Buyers", images: ["/hero-vanilla.png"] },
  icons: { icon: "/favicon.svg" },
};

const schema = { "@context": "https://schema.org", "@type": "Organization", name: "Ask Global", url: "https://ask-global-exporter-web.vercel.app", description: "Indonesian trading company connecting global buyers with premium Indonesian commodities", email: "askglobalexporter@gmail.com", telephone: "+62-851-9659-8995", areaServed: "Worldwide", address: { "@type": "PostalAddress", addressLocality: "Jakarta", addressCountry: "ID" } };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${manrope.variable} ${cormorant.variable}`}><body>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}} /></body></html>;
}
