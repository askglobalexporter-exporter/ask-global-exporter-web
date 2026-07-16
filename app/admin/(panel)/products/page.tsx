import Image from "next/image";
import { Boxes, Plus, Trash2 } from "lucide-react";
import { deleteProductAction, saveProductAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin/auth";
import { SubmitButton } from "@/components/admin/SubmitButton";

export const metadata = { title: "Products" };

type ProductRow = { id:string;slug:string;name:string;category:string;short_description:string;description:string;origin:string;status:string;is_featured:boolean;position:number;specifications:Array<{label:string;value:string}>;grades:string[];packaging_options:string[];moq:string|null;lead_time:string|null;incoterms:string[];primary_image_url:string|null;seo_title:string|null;seo_description:string|null;product_images:Array<{image_url:string;position:number}> };

function ProductFields({ product }: { product?: ProductRow }) {
  return <div className="admin-form-grid">
    <input type="hidden" name="id" value={product?.id ?? ""} />
    <label><span>Product name</span><input name="name" defaultValue={product?.name} required /></label>
    <label><span>URL slug</span><input name="slug" defaultValue={product?.slug} placeholder="generated-from-name" /></label>
    <label><span>Category</span><input name="category" defaultValue={product?.category ?? "Agricultural Commodities"} required /></label>
    <label><span>Origin</span><input name="origin" defaultValue={product?.origin ?? "Indonesia"} /></label>
    <label><span>Status</span><select name="status" defaultValue={product?.status ?? "draft"}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
    <label><span>Display order</span><input name="position" type="number" defaultValue={product?.position ?? 0} /></label>
    <label className="admin-field-full"><span>Short description</span><textarea name="short_description" defaultValue={product?.short_description} rows={2} /></label>
    <label className="admin-field-full"><span>Full description</span><textarea name="description" defaultValue={product?.description} rows={5} /></label>
    <label><span>MOQ</span><input name="moq" defaultValue={product?.moq ?? ""} /></label>
    <label><span>Lead time</span><input name="lead_time" defaultValue={product?.lead_time ?? ""} /></label>
    <label className="admin-field-full"><span>Primary image URL</span><input name="primary_image_url" type="url" defaultValue={product?.primary_image_url ?? ""} placeholder="Choose or paste a Media Library URL" /></label>
    <label className="admin-field-full"><span>Gallery image URLs · one per line</span><textarea name="gallery_images" rows={4} defaultValue={product?.product_images?.sort((a,b)=>a.position-b.position).map((image)=>image.image_url).join("\n") ?? ""} placeholder="https://ik.imagekit.io/…" /><small>The primary image is automatically included first on the public product page.</small></label>
    <label><span>Grades · one per line</span><textarea name="grades" defaultValue={product?.grades?.join("\n")} /></label>
    <label><span>Packaging · one per line</span><textarea name="packaging_options" defaultValue={product?.packaging_options?.join("\n")} /></label>
    <label><span>Incoterms · comma-separated</span><input name="incoterms" defaultValue={product?.incoterms?.join(", ")} /></label>
    <label><span>Specifications · Label: Value</span><textarea name="specifications" defaultValue={product?.specifications?.map((row) => `${row.label}: ${row.value}`).join("\n")} /></label>
    <label className="admin-field-full"><span>SEO title</span><input name="seo_title" defaultValue={product?.seo_title ?? ""} /></label>
    <label className="admin-field-full"><span>SEO description</span><textarea name="seo_description" defaultValue={product?.seo_description ?? ""} /></label>
    <label className="admin-check admin-field-full"><input name="is_featured" type="checkbox" defaultChecked={product?.is_featured} /><span>Feature this product on priority placements</span></label>
  </div>;
}

export default async function ProductsAdminPage() {
  const { supabase } = await requireAdmin("products.read");
  const { data } = await supabase.from("products").select("*,product_images(image_url,position)").order("position").order("updated_at", { ascending: false });
  const products = (data ?? []) as ProductRow[];
  return <><div className="admin-page-head"><div><h1>Product catalogue</h1><p>Create, publish, feature, and maintain export-ready product specifications.</p></div><div className="admin-page-actions"><span className="admin-badge published">{products.filter((p) => p.status === "published").length} live</span></div></div>
    <div className="admin-split"><article className="admin-card"><div className="admin-card-head"><div><h2><Plus size={14} /> Add product</h2><p>Start in draft and publish when ready.</p></div></div><form action={saveProductAction} className="admin-form"><ProductFields /><div className="admin-form-actions"><SubmitButton pendingLabel="Creating…">Create product</SubmitButton></div></form></article>
      <section>{products.length ? products.map((product) => <details className="admin-list-card" key={product.id}><summary>{product.primary_image_url ? <Image className="admin-list-thumb" src={product.primary_image_url} alt="" width={48} height={48} unoptimized /> : <span className="admin-list-thumb" />}<div><b>{product.name}</b><small>/{product.slug} · {product.category}</small></div>{product.is_featured && <span className="admin-badge contacted">Featured</span>}<span className={`admin-badge ${product.status}`}>{product.status}</span></summary><div className="admin-list-card-body"><form action={saveProductAction} className="admin-form"><ProductFields product={product} /><div className="admin-form-actions"><SubmitButton>Save changes</SubmitButton></div></form><form action={deleteProductAction} className="admin-form-actions"><input type="hidden" name="id" value={product.id} /><SubmitButton className="admin-danger-button" pendingLabel="Deleting…"><Trash2 size={13} />Delete product</SubmitButton></form></div></details>) : <div className="admin-card admin-empty"><Boxes size={24} /><h3>No database products yet</h3><p>Create the first product or seed the existing vanilla catalogue.</p></div>}</section>
    </div></>;
}
