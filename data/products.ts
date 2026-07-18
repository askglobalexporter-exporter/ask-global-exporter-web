export type ProductSpecification = { label: string; value: string };
export type ProductFaq = { question: string; answer: string };

export type Product = {
  slug: string;
  name: string;
  shortName: string;
  category: string;
  origin: string;
  moq: string;
  shortDescription?: string;
  description: string;
  image: string;
  gallery: string[];
  grade: string;
  typicalLength: string;
  moisture: string;
  application: string;
  packaging: string[];
  leadTime: string;
  shipping: string;
  monthlyCapacity: string;
  specifications: ProductSpecification[];
  faqs: ProductFaq[];
  seoTitle: string;
  seoDescription: string;
  isFeatured?: boolean;
  incoterms?: string[];
  grades?: string[];
};

export const defaultBuyerFaqs: ProductFaq[] = [
  { question: "What is the minimum order quantity?", answer: "MOQ depends on product grade, packaging, lot availability, and destination. The confirmed MOQ will be included in our quotation." },
  { question: "Can we request a sample before placing a bulk order?", answer: "Yes. Samples are available for qualified buyers, subject to approval and product availability. Sample and courier charges may apply." },
  { question: "Can product specifications be customized?", answer: "Yes. Sorting, moisture range, bean length, packaging, and other requirements can be discussed and confirmed against an approved lot or sample." },
  { question: "Which export documents can you provide?", answer: "Commercial Invoice and Packing List are standard. Certificate of Origin, Phytosanitary Certificate, Fumigation Certificate, and other documents can be arranged when required." },
  { question: "What packaging options are available?", answer: "Products can be supplied in vacuum-sealed food-grade inner packs and export cartons. Custom pack sizes, buyer labels, and private-label packaging can be discussed." },
  { question: "How long does an export order take?", answer: "Lead time depends on product availability, volume, packaging, documentation, and destination. The confirmed timeline will be stated in the quotation." },
  { question: "Which Incoterms are available?", answer: "EXW, FOB, CFR, CIF, and DAP may be discussed. The final Incoterm depends on the shipment, destination, and commercial agreement." },
  { question: "Can you support repeat or monthly orders?", answer: "Yes. Repeat-order sourcing can be arranged, subject to seasonal availability, approved specifications, and confirmed monthly capacity." },
];

const commonSpecs = (grade: string, form: string): ProductSpecification[] => [
  { label: "Botanical name", value: "Vanilla planifolia" },
  { label: "Origin", value: "Indonesia — exact region confirmed per lot" },
  { label: "Grade", value: grade },
  { label: "Length", value: "To be confirmed against buyer specification" },
  { label: "Moisture", value: "Confirmed per approved lot" },
  { label: "Vanillin content", value: "Certificate of Analysis when available" },
  { label: "Appearance", value: form },
  { label: "Color", value: "Dark brown to black; confirmed per lot" },
  { label: "Texture", value: "Confirmed by sample and grade" },
  { label: "Aroma", value: "Rich vanilla profile; lot sample available" },
  { label: "Packaging", value: "Vacuum pack or custom export packaging" },
  { label: "MOQ", value: "Available upon request" },
  { label: "Lead time", value: "Confirmed with quotation" },
  { label: "Shelf life", value: "Confirmed by packaging and specification" },
  { label: "Storage", value: "Cool, dry place away from direct sunlight" },
];

export const products: Product[] = [
  {
    slug: "grade-a-vanilla-beans", name: "Grade A Vanilla Beans", shortName: "Grade A", category: "Whole Vanilla Beans",
    origin: "Indonesia", moq: "Available upon request", grade: "Premium / Gourmet Grade A",
    typicalLength: "To be confirmed", moisture: "Confirmed per lot", application: "Premium culinary, pastry, hospitality, retail",
    description: "Premium whole Indonesian vanilla beans selected for appearance, flexibility, aroma, and buyer-specific requirements.",
    image: "/vanilla-grade-a.webp", gallery: ["/vanilla-grade-a.webp", "/hero-vanilla.webp", "/vanilla-grade-b.webp"],
    packaging: ["Vacuum-sealed inner packs", "Food-grade export cartons", "Custom pack sizes upon agreement"],
    leadTime: "Confirmed with quotation", shipping: "International air and sea freight", monthlyCapacity: "Available upon request",
    specifications: commonSpecs("Premium / Gourmet Grade A", "Whole, cured vanilla beans"), faqs: defaultBuyerFaqs,
    seoTitle: "Grade A Vanilla Beans Indonesia | Premium Export Supplier",
    seoDescription: "Source premium Grade A Indonesian vanilla beans with buyer-specific sorting, vacuum packaging, samples, and export documentation support.",
  },
  {
    slug: "grade-b-vanilla-beans", name: "Grade B Vanilla Beans", shortName: "Grade B", category: "Extraction Vanilla Beans",
    origin: "Indonesia", moq: "Available upon request", grade: "Extraction Grade B",
    typicalLength: "To be confirmed", moisture: "Confirmed per lot", application: "Vanilla extract, paste, flavor manufacturing",
    description: "Extraction-focused whole vanilla beans supplied to ingredient processors and manufacturers against agreed specifications.",
    image: "/vanilla-grade-b.webp", gallery: ["/vanilla-grade-b.webp", "/vanilla-grade-a.webp", "/vanilla-cuts.webp"],
    packaging: ["Vacuum-sealed bulk packs", "Food-grade export cartons", "Custom industrial packaging"],
    leadTime: "Confirmed with quotation", shipping: "International air and sea freight", monthlyCapacity: "Available upon request",
    specifications: commonSpecs("Extraction Grade B", "Whole cured beans; appearance varies by lot"), faqs: defaultBuyerFaqs,
    seoTitle: "Grade B Vanilla Beans Indonesia | Extraction Grade Supplier",
    seoDescription: "Indonesian Grade B vanilla beans for extraction and manufacturing, supplied with editable specifications and export support.",
  },
  {
    slug: "vanilla-cuts", name: "Vanilla Cuts", shortName: "Vanilla Cuts", category: "Processed Vanilla",
    origin: "Indonesia", moq: "Available upon request", grade: "Cut Vanilla / Extraction Material",
    typicalLength: "Custom cut size", moisture: "Confirmed per lot", application: "Extraction, milling, industrial processing",
    description: "Cut cured vanilla bean material prepared for extraction, milling, and industrial ingredient applications.",
    image: "/vanilla-cuts.webp", gallery: ["/vanilla-cuts.webp", "/vanilla-grade-b.webp", "/vanilla-powder.webp"],
    packaging: ["Vacuum-sealed bulk packs", "Food-grade liner and carton", "Custom cut and pack specification"],
    leadTime: "Confirmed with quotation", shipping: "International air and sea freight", monthlyCapacity: "Available upon request",
    specifications: commonSpecs("Vanilla Cuts", "Cut cured vanilla bean segments"), faqs: defaultBuyerFaqs,
    seoTitle: "Vanilla Cuts Indonesia | Bulk Extraction Supplier",
    seoDescription: "Source Indonesian vanilla cuts for extraction and industrial applications with custom sizing and export-ready packaging.",
  },
  {
    slug: "vanilla-powder", name: "Vanilla Powder", shortName: "Vanilla Powder", category: "Processed Vanilla",
    origin: "Indonesia", moq: "Available upon request", grade: "Ground Vanilla — availability to be confirmed",
    typicalLength: "Fine powder", moisture: "Confirmed per lot", application: "Dry blends, bakery, food manufacturing",
    description: "Ground vanilla material for dry applications. Commercial availability, mesh size, and specification must be confirmed before quotation.",
    image: "/vanilla-powder.webp", gallery: ["/vanilla-powder.webp", "/vanilla-cuts.webp", "/vanilla-grade-a.webp"],
    packaging: ["Food-grade sealed inner packs", "Export carton", "Custom pack sizes upon agreement"],
    leadTime: "Confirmed with quotation", shipping: "International air and sea freight", monthlyCapacity: "Available upon request",
    specifications: commonSpecs("Ground Vanilla — subject to availability", "Fine ground vanilla material"), faqs: defaultBuyerFaqs,
    seoTitle: "Vanilla Powder Indonesia | Bulk Vanilla Ingredient",
    seoDescription: "Indonesian vanilla powder for B2B ingredient applications, subject to confirmed availability and buyer specification.",
  },
];

export function getProduct(slug: string) { return products.find((product) => product.slug === slug); }
