"use client";

import Image from "next/image";
import { Leaf } from "lucide-react";
import { useCompanySettings } from "./CompanySettingsProvider";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  const company = useCompanySettings();
  const brandParts = company.brand_name.trim().split(/\s+/).filter(Boolean);
  const primaryName = brandParts[0] || "ASK";
  const secondaryName = brandParts.slice(1).join(" ");
  if (company.logo_url) return <span className={`company-logo${compact ? " compact" : ""}`} aria-label={company.brand_name}>
    <Image src={company.logo_url} alt={company.brand_name} width={compact ? 110 : 150} height={compact ? 38 : 52} unoptimized />
  </span>;
  return <span className={`alya-wordmark${compact ? " compact" : ""}`} aria-label={company.brand_name}>
    <span className="alya-name">{primaryName}<Leaf aria-hidden="true" /></span>
    {secondaryName && <span className="alya-subtitle">{secondaryName}</span>}
  </span>;
}
