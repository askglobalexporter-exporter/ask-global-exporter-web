import { Leaf } from "lucide-react";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return <span className={`alya-wordmark${compact ? " compact" : ""}`} aria-label="Ask Global">
    <span className="alya-name">ASK<Leaf aria-hidden="true" /></span>
    <span className="alya-subtitle">Global</span>
  </span>;
}
