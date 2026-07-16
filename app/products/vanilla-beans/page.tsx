import type { Metadata } from "next";
import { VanillaExportPage } from "@/components/VanillaExportPage";

export const metadata: Metadata = {
  title: "Indonesian Vanilla Beans Exporter & Wholesale Supplier",
  description: "Source Indonesian Vanilla planifolia for B2B requirements. Grade A, extraction beans and processed formats with specifications confirmed per lot and export support.",
  keywords: ["Indonesian vanilla beans", "vanilla bean exporter", "bulk vanilla supplier", "Vanilla planifolia Indonesia", "wholesale vanilla beans"],
  alternates: { canonical: "/products/vanilla-beans" },
  openGraph: { title: "Premium Indonesian Vanilla Beans for Export", description: "Direct sourcing, export-ready grades, vacuum packaging and worldwide delivery from Ask Global.", images: ["/hero-vanilla.webp"] },
};

export default function VanillaBeansPage() { return <VanillaExportPage />; }
