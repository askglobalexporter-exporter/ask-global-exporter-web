import type { AdminRole } from "./types";

export const cmsCollections = ["about", "faq", "testimonial", "blog", "export_document", "company_profile"] as const;
export type CmsCollection = typeof cmsCollections[number];

export const cmsCollectionLabels: Record<CmsCollection, string> = {
  about: "Tentang kami",
  faq: "FAQ",
  testimonial: "Testimoni",
  blog: "Artikel blog",
  export_document: "Dokumen ekspor",
  company_profile: "Profil perusahaan",
};

export function allowedCmsCollections(role: AdminRole): CmsCollection[] {
  return role === "marketing" ? ["testimonial", "blog"] : [...cmsCollections];
}

export function isCmsCollection(value: string): value is CmsCollection {
  return cmsCollections.includes(value as CmsCollection);
}
