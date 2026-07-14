import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });
const cormorant = Cormorant_Garamond({ variable: "--font-display", subsets: ["latin"], weight: ["500", "600"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://alyaglobaltrade.com"),
  title: { default: "ALYA Global Trade — Premium Indonesian Products", template: "%s | ALYA Global Trade" },
  description: "Trusted export partner for premium Indonesian products, international sourcing, quality assurance, and global shipping.",
  keywords: ["Export Company", "Indonesian Products", "International Trade", "Global Supplier", "Wholesale Products"],
  openGraph: { title: "ALYA Global Trade", description: "Premium Indonesian Products For Global Markets", type: "website", locale: "en_US", images: [{ url: "/og.png", width: 1200, height: 630, alt: "ALYA Global Trade — Premium Indonesian Products For Global Markets" }] },
  twitter: { card: "summary_large_image", title: "ALYA Global Trade", description: "Premium Indonesian Products For Global Markets", images: ["/og.png"] },
  icons: { icon: "/favicon.svg" },
};

const schema = { "@context": "https://schema.org", "@type": "Organization", name: "ALYA Global Trade", url: "https://alyaglobaltrade.com", description: "Indonesian export and international trading company", email: "hello@alyaglobaltrade.com", areaServed: "Worldwide", address: { "@type": "PostalAddress", addressLocality: "Jakarta", addressCountry: "ID" } };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${manrope.variable} ${cormorant.variable}`}><body>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}} /></body></html>;
}
