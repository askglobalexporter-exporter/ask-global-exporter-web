import { Leaf } from "lucide-react";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return <span className={`alya-wordmark${compact ? " compact" : ""}`} aria-label="ALYA Global Trade">
    <span className="alya-name">ALYA<Leaf aria-hidden="true" /></span>
    <span className="alya-subtitle">Global Trade</span>
  </span>;
}
