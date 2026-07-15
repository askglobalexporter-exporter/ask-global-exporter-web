import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/ProductDetail";
import { getProduct, products } from "@/data/products";

export function generateStaticParams() {
  return products.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) return {};
  return { title: product.seoTitle, description: product.seoDescription, alternates:{canonical:`/products/${product.slug}`}, openGraph:{title:product.seoTitle,description:product.seoDescription,images:[product.image]}, twitter:{card:"summary_large_image",title:product.seoTitle,description:product.seoDescription,images:[product.image]} };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  const productSchema = {"@context":"https://schema.org","@type":"Product",name:product.name,description:product.description,image:product.gallery.map(x=>`https://alya-global-trade.vercel.app${x}`),brand:{"@type":"Brand",name:"ALYA Global Trade"},countryOfOrigin:"Indonesia"};
  const breadcrumbSchema = {"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"Home",item:"https://alya-global-trade.vercel.app"},{"@type":"ListItem",position:2,name:"Vanilla Products",item:"https://alya-global-trade.vercel.app/#products"},{"@type":"ListItem",position:3,name:product.name,item:`https://alya-global-trade.vercel.app/products/${product.slug}`}]};
  const faqSchema = {"@context":"https://schema.org","@type":"FAQPage",mainEntity:product.faqs.map(x=>({"@type":"Question",name:x.question,acceptedAnswer:{"@type":"Answer",text:x.answer}}))};
  return <><ProductDetail product={product} /><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify([productSchema,breadcrumbSchema,faqSchema])}} /></>;
}
