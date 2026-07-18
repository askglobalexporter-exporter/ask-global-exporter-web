import Image from "next/image";
import Link from "next/link";
import { Boxes, Plus, Trash2 } from "lucide-react";
import { deleteProductAction, saveProductAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin/auth";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { AdminLivePreview } from "@/components/admin/AdminLivePreview";
import { AdminLazyDetails } from "@/components/admin/AdminLazyDetails";
import { AdminPagination } from "@/components/admin/AdminPagination";

export const metadata = { title: "Products" };

type ProductSummary = { id:string;slug:string;name:string;category:string;status:string;is_featured:boolean;position:number;primary_image_url:string|null };
type ProductRow = ProductSummary & { short_description:string;description:string;origin:string;specifications:Array<{label:string;value:string}>;grades:string[];packaging_options:string[];moq:string|null;lead_time:string|null;incoterms:string[];seo_title:string|null;seo_description:string|null;product_images:Array<{image_url:string;position:number}> };

function ProductFields({ product }: { product?: ProductRow }) {
  return <div className="admin-form-grid">
    <input type="hidden" name="id" value={product?.id ?? ""} />
    <label><span>Nama produk</span><input name="name" defaultValue={product?.name} required /></label>
    <label><span>Alamat halaman (slug)</span><input name="slug" defaultValue={product?.slug} placeholder="otomatis-dari-nama" /><small>Gunakan huruf kecil dan tanda minus.</small></label>
    <label><span>Kategori</span><input name="category" defaultValue={product?.category ?? "Agricultural Commodities"} required /></label>
    <label><span>Asal produk</span><input name="origin" defaultValue={product?.origin ?? "Indonesia"} /></label>
    <label><span>Status publikasi</span><select name="status" defaultValue={product?.status ?? "draft"}><option value="draft">Draft — belum tampil</option><option value="published">Terbit — tampil di website</option><option value="archived">Arsip</option></select></label>
    <label><span>Urutan tampil</span><input name="position" type="number" defaultValue={product?.position ?? 0} /><small>Angka kecil tampil lebih dahulu.</small></label>
    <label className="admin-field-full"><span>Deskripsi singkat</span><textarea name="short_description" defaultValue={product?.short_description} rows={2} /></label>
    <label className="admin-field-full"><span>Deskripsi lengkap</span><textarea name="description" defaultValue={product?.description} rows={5} /></label>
    <label><span>MOQ</span><input name="moq" defaultValue={product?.moq ?? ""} /></label>
    <label><span>Waktu persiapan</span><input name="lead_time" defaultValue={product?.lead_time ?? ""} /></label>
    <ImageUploadField name="primary_image_url" label="Foto utama produk" defaultValue={product?.primary_image_url ?? ""} folder="products" help="Dipakai pada kartu produk dan bagian utama halaman produk." />
    <ImageUploadField name="gallery_images" label="Galeri produk" defaultValue={product?.product_images?.sort((a,b)=>a.position-b.position).map((image)=>image.image_url) ?? []} multiple folder="products" help="Upload beberapa foto, lalu atur urutannya dengan tombol panah." />
    <label><span>Grade — satu per baris</span><textarea name="grades" defaultValue={product?.grades?.join("\n")} /></label>
    <label><span>Kemasan — satu per baris</span><textarea name="packaging_options" defaultValue={product?.packaging_options?.join("\n")} /></label>
    <label><span>Incoterm — pisahkan koma</span><input name="incoterms" defaultValue={product?.incoterms?.join(", ")} /></label>
    <label><span>Spesifikasi — Nama: Nilai</span><textarea name="specifications" defaultValue={product?.specifications?.map((row) => `${row.label}: ${row.value}`).join("\n")} /><small>Contoh: Panjang: 16–20 cm</small></label>
    <label className="admin-field-full"><span>Judul SEO</span><input name="seo_title" defaultValue={product?.seo_title ?? ""} /></label>
    <label className="admin-field-full"><span>Deskripsi SEO</span><textarea name="seo_description" defaultValue={product?.seo_description ?? ""} /></label>
    <label className="admin-check admin-field-full"><input name="is_featured" type="checkbox" defaultChecked={product?.is_featured} /><span>Prioritaskan produk ini pada halaman publik</span></label>
  </div>;
}

const PAGE_SIZE = 10;

export default async function ProductsAdminPage({ searchParams }: { searchParams: Promise<{ page?: string; edit?: string }> }) {
  const { supabase } = await requireAdmin("products.read");
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const listQuery = supabase.from("products").select("id,slug,name,category,status,is_featured,position,primary_image_url", { count: "exact" }).order("position").order("updated_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);
  const selectedQuery = params.edit
    ? supabase.from("products").select("id,slug,name,category,short_description,description,origin,status,is_featured,position,specifications,grades,packaging_options,moq,lead_time,incoterms,primary_image_url,seo_title,seo_description,product_images(image_url,position)").eq("id", params.edit).maybeSingle()
    : Promise.resolve({ data: null });
  const [{ data, count }, selectedResult] = await Promise.all([listQuery, selectedQuery]);
  const products = (data ?? []) as ProductSummary[];
  const selectedProduct = (selectedResult?.data ?? null) as ProductRow | null;
  const pageCount = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  return <><div className="admin-page-head"><div><h1>Katalog produk</h1><p>Tambah dan perbarui produk. Preview akan berubah langsung sebelum Anda menyimpan.</p></div><div className="admin-page-actions"><span className="admin-badge published">{count ?? 0} produk</span></div></div>
    <div className="admin-split"><article className="admin-card"><div className="admin-card-head"><div><h2><Plus size={14} /> Tambah produk</h2><p>Mulai sebagai draft, periksa preview, lalu terbitkan saat siap.</p></div></div><form action={saveProductAction} className="admin-form"><ProductFields /><AdminLivePreview kind="product" label="Preview produk"/><div className="admin-form-actions"><SubmitButton pendingLabel="Membuat…">Buat produk</SubmitButton></div></form></article>
      <section>
        {selectedProduct && <article className="admin-card admin-list-card-body"><div className="admin-card-head"><div><h2>Edit {selectedProduct.name}</h2><p>Data lengkap dan galeri hanya dimuat untuk produk ini.</p></div><Link className="admin-secondary-button" href={`/admin/products?page=${page}`}>Tutup</Link></div><form action={saveProductAction} className="admin-form"><ProductFields product={selectedProduct} /><AdminLivePreview kind="product" label="Preview perubahan"/><div className="admin-form-actions"><SubmitButton>Simpan perubahan</SubmitButton></div></form><form action={deleteProductAction} className="admin-form-actions"><input type="hidden" name="id" value={selectedProduct.id} /><SubmitButton className="admin-danger-button" pendingLabel="Menghapus…"><Trash2 size={13} />Hapus produk</SubmitButton></form></article>}
        {params.edit && !selectedProduct && <div className="admin-alert error">Produk yang dipilih tidak ditemukan atau sudah dihapus.</div>}
        {products.length ? products.map((product) => <AdminLazyDetails key={product.id} summary={<>{product.primary_image_url ? <Image className="admin-list-thumb" src={product.primary_image_url} alt="" width={48} height={48} unoptimized /> : <span className="admin-list-thumb" />}<div><b>{product.name}</b><small>/{product.slug} · {product.category}</small></div>{product.is_featured && <span className="admin-badge contacted">Prioritas</span>}<span className={`admin-badge ${product.status}`}>{product.status}</span></>}><div className="admin-list-card-body"><p>Data lengkap belum dimuat agar halaman tetap ringan.</p><Link className="admin-primary-button" href={`/admin/products?page=${page}&edit=${product.id}`}>Edit produk</Link></div></AdminLazyDetails>) : <div className="admin-card admin-empty"><Boxes size={24} /><h3>Belum ada produk</h3><p>Gunakan formulir di sebelah kiri untuk menambahkan produk pertama.</p></div>}
        <AdminPagination basePath="/admin/products" page={page} pageCount={pageCount} />
      </section>
    </div></>;
}
