export type Product = {
  slug: string;
  name: string;
  category: string;
  origin: string;
  moq: string;
  description: string;
  image: string;
  gallery: string[];
  grade: string;
  packaging: string[];
  leadTime: string;
  shipping: string;
};

export const products: Product[] = [
  {
    slug: "premium-vanilla-beans",
    name: "Premium Vanilla Beans",
    category: "Spices",
    origin: "Papua, Indonesia",
    moq: "25 kg",
    description: "Hand-selected Planifolia vanilla with a deep, creamy aroma and consistent moisture for culinary and industrial buyers.",
    image: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=1400&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=1600&q=90",
      "https://images.unsplash.com/photo-1616684000067-36952fde56ec?auto=format&fit=crop&w=1400&q=85",
    ],
    grade: "Grade A, 16–20 cm",
    packaging: ["Vacuum pack", "Food-grade carton", "Custom private label"],
    leadTime: "14–21 days",
    shipping: "Air freight & sea freight worldwide",
  },
  {
    slug: "gayo-arabica-coffee",
    name: "Gayo Arabica Coffee",
    category: "Coffee",
    origin: "Aceh, Indonesia",
    moq: "1 metric ton",
    description: "Specialty-grade green beans from the Gayo highlands, valued for a clean cup, floral notes, and balanced body.",
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1400&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1600&q=90",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1400&q=85",
    ],
    grade: "Specialty, 80+ cup score",
    packaging: ["60 kg jute bag", "GrainPro liner", "Custom bulk packaging"],
    leadTime: "21–30 days",
    shipping: "Sea freight from Belawan",
  },
  {
    slug: "desiccated-coconut",
    name: "Desiccated Coconut",
    category: "Coconut Products",
    origin: "Sulawesi, Indonesia",
    moq: "2 metric tons",
    description: "Fine, naturally white coconut with controlled moisture and food-grade processing for bakery and confectionery production.",
    image: "https://images.unsplash.com/photo-1580984969071-a8da5656c2fb?auto=format&fit=crop&w=1400&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1580984969071-a8da5656c2fb?auto=format&fit=crop&w=1600&q=90",
      "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1400&q=85",
    ],
    grade: "Fine & medium grade",
    packaging: ["25 kg kraft bag", "PE inner liner", "Palletized"],
    leadTime: "14–21 days",
    shipping: "Reefer or dry container worldwide",
  },
  {
    slug: "whole-black-pepper",
    name: "Whole Black Pepper",
    category: "Spices",
    origin: "Lampung, Indonesia",
    moq: "500 kg",
    description: "Bold Lampung peppercorns with strong pungency, uniform grading, and export-ready cleaning and packing.",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1400&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1600&q=90",
      "https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=1400&q=85",
    ],
    grade: "500–550 GL",
    packaging: ["25 kg PP bag", "Kraft paper bag", "Buyer specification"],
    leadTime: "14–21 days",
    shipping: "Sea freight from Tanjung Priok",
  },
  {
    slug: "rattan-lounge-chair",
    name: "Artisan Rattan Lounge Chair",
    category: "Furniture",
    origin: "Cirebon, Indonesia",
    moq: "50 units",
    description: "Handwoven natural rattan furniture shaped by skilled artisans and finished for hospitality and premium retail collections.",
    image: "https://images.unsplash.com/photo-1598300056393-4aac492f4344?auto=format&fit=crop&w=1400&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1598300056393-4aac492f4344?auto=format&fit=crop&w=1600&q=90",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1400&q=85",
    ],
    grade: "Commercial hospitality grade",
    packaging: ["Export carton", "Protective wrap", "Custom labeling"],
    leadTime: "30–45 days",
    shipping: "FCL sea freight worldwide",
  },
  {
    slug: "organic-turmeric",
    name: "Organic Turmeric",
    category: "Herbal Products",
    origin: "Java, Indonesia",
    moq: "500 kg",
    description: "Vibrant dried turmeric fingers with high natural color, carefully sourced and traceable to partner farms.",
    image: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=1400&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=1600&q=90",
      "https://images.unsplash.com/photo-1609241801035-05b669e166bf?auto=format&fit=crop&w=1400&q=85",
    ],
    grade: "Whole dried fingers",
    packaging: ["20 kg kraft bag", "Food-grade liner", "Custom milling available"],
    leadTime: "14–21 days",
    shipping: "Air & sea freight worldwide",
  },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}
