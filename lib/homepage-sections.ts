export type HomepageEditableContent = {
  eyebrow?: string;
  title?: string;
  summary?: string;
  body?: string;
  cta_label?: string;
  cta_url?: string;
  image_url?: string;
};

export const homepageSectionDefaults: Record<string, HomepageEditableContent> = {
  hero: {
    eyebrow: "Premium Indonesian vanilla",
    title: "Vanilla Beans",
    summary: "Natural, aromatic, and export-ready—sourced with care in Indonesia.",
    cta_label: "Request quotation",
    cta_url: "/products/vanilla-beans#quotation",
    image_url: "/vanilla-grade-a.webp",
  },
  about: { title: "From the heart of Indonesia, to businesses worldwide." },
  products: {
    title: "Indonesian vanilla, prepared for B2B buyers.",
    summary: "Explore whole-bean grades and processed formats. Final specifications and commercial availability are confirmed per lot and quotation.",
  },
  focus: {
    title: "Indonesian supply, built for global business.",
    summary: "Our sourcing network and trading capabilities support buyers across six core areas.",
  },
  process: { title: "From supplier sourcing to international shipping." },
  compliance: {
    title: "Documentation that supports each shipment.",
    summary: "Availability depends on destination rules, shipment type, and agreement. We confirm the required document set before order finalization.",
  },
  testimonials: {
    title: "Partnerships built on reliable execution.",
    summary: "Selected feedback from buyers and commercial partners.",
  },
  faq: { title: "Questions global buyers ask before sourcing." },
  blog: { title: "Insights for responsible sourcing." },
  contact: {
    title: "Ready to source from Indonesia?",
    summary: "Share your product, specification, quantity, packaging, and destination. Our team will respond with availability and the next sourcing steps.",
  },
};

export const homepageSectionGuidance: Record<string, {
  name: string;
  description: string;
  fields: Array<keyof HomepageEditableContent>;
  relatedLabel?: string;
  relatedHref?: string;
}> = {
  hero: { name: "Hero slideshow", description: "Banner utama yang pertama kali dilihat pengunjung.", fields: [] },
  about: { name: "Tentang Ask Global", description: "Judul pengantar perusahaan pada halaman beranda.", fields: ["title"], relatedLabel: "Edit isi Tentang kami", relatedHref: "/admin/content?collection=about" },
  products: { name: "Produk unggulan", description: "Judul dan pengantar katalog produk.", fields: ["title", "summary"], relatedLabel: "Kelola daftar produk", relatedHref: "/admin/products" },
  focus: { name: "Fokus perusahaan", description: "Pengantar kapabilitas dan fokus bisnis Ask Global.", fields: ["title", "summary"] },
  process: { name: "Proses ekspor", description: "Judul alur sourcing sampai pengiriman internasional.", fields: ["title"] },
  compliance: { name: "Dokumen ekspor", description: "Pengantar dokumen yang mendukung setiap pengiriman.", fields: ["title", "summary"], relatedLabel: "Kelola daftar dokumen", relatedHref: "/admin/content?collection=export_document" },
  testimonials: { name: "Testimoni", description: "Judul dan pengantar feedback buyer.", fields: ["title", "summary"], relatedLabel: "Kelola testimoni", relatedHref: "/admin/content?collection=testimonial" },
  faq: { name: "FAQ buyer", description: "Judul bagian pertanyaan yang sering diajukan.", fields: ["title"], relatedLabel: "Kelola pertanyaan FAQ", relatedHref: "/admin/content?collection=faq" },
  blog: { name: "Artikel dan insight", description: "Judul bagian artikel pada beranda.", fields: ["title"], relatedLabel: "Kelola artikel", relatedHref: "/admin/content?collection=blog" },
  contact: { name: "Ajakan menghubungi", description: "Ajakan sebelum informasi WhatsApp, email, dan alamat.", fields: ["title", "summary"], relatedLabel: "Edit kontak perusahaan", relatedHref: "/admin/company" },
};

export function resolvedHomepageContent(sectionKey: string, content?: HomepageEditableContent | null) {
  return { ...(homepageSectionDefaults[sectionKey] ?? {}), ...(content ?? {}) };
}
