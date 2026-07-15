import type { Metadata } from "next";
import { VanillaExportPage } from "@/components/VanillaExportPage";

export const metadata: Metadata = {
  title: "Indonesian Vanilla Beans Exporter & Wholesale Supplier",
  description: "Source premium Indonesian Vanilla planifolia. Export-ready Grade A and extraction beans, MOQ from 25 kg, vacuum packaging, worldwide shipping and export documents.",
  keywords: ["Indonesian vanilla beans", "vanilla bean exporter", "bulk vanilla supplier", "Vanilla planifolia Indonesia", "wholesale vanilla beans"],
  alternates: { canonical: "/products/vanilla-beans" },
  openGraph: { title: "Premium Indonesian Vanilla Beans for Export", description: "Direct sourcing, export-ready grades, vacuum packaging and worldwide delivery from ALYA Global Trade.", images: ["/hero-vanilla.png"] },
};

export default function VanillaBeansPage() { return <VanillaExportPage />; }
