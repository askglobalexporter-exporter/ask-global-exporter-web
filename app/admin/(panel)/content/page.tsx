import Link from "next/link";
import { FileText, Plus, Trash2 } from "lucide-react";
import { deleteCmsEntryAction, saveCmsEntryAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin/auth";

const collections = ["homepage","about","faq","testimonial","blog","export_document","company_profile"];
export const metadata = { title: "Content" };

type CmsRow = { id:string;collection:string;slug:string;title:string;excerpt:string|null;content:{body?:string;cta_label?:string;cta_url?:string};status:string;featured_image_url:string|null;updated_at:string };

function CmsFields({ collection, entry }: { collection: string; entry?: CmsRow }) {
  return <div className="admin-form-grid"><input type="hidden" name="id" value={entry?.id ?? ""} /><input type="hidden" name="collection" value={collection} />
    <label><span>Title</span><input name="title" defaultValue={entry?.title} required /></label><label><span>Slug / key</span><input name="slug" defaultValue={entry?.slug} /></label>
    <label><span>Status</span><select name="status" defaultValue={entry?.status ?? "draft"}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label><label><span>Featured image URL</span><input name="featured_image_url" defaultValue={entry?.featured_image_url ?? ""} /></label>
    <label className="admin-field-full"><span>Summary</span><textarea name="excerpt" rows={2} defaultValue={entry?.excerpt ?? ""} /></label><label className="admin-field-full"><span>Content</span><textarea name="body" rows={7} defaultValue={entry?.content?.body ?? ""} /></label>
    <label><span>CTA label</span><input name="cta_label" defaultValue={entry?.content?.cta_label ?? ""} /></label><label><span>CTA URL</span><input name="cta_url" defaultValue={entry?.content?.cta_url ?? ""} /></label>
  </div>;
}

export default async function ContentAdminPage({ searchParams }: { searchParams: Promise<{ collection?: string }> }) {
  const { supabase } = await requireAdmin("dashboard.read");
  const params = await searchParams; const collection = collections.includes(params.collection ?? "") ? params.collection! : "about";
  const { data } = await supabase.from("cms_entries").select("*").eq("collection", collection).order("updated_at", { ascending: false });
  const entries = (data ?? []) as CmsRow[];
  return <><div className="admin-page-head"><div><h1>Content management</h1><p>Edit core pages, FAQs, testimonials, blog articles, export documents, and company information.</p></div></div><nav className="admin-tabs">{collections.map((item) => <Link key={item} className={collection === item ? "active" : ""} href={`/admin/content?collection=${item}`}>{item.replaceAll("_", " ")}</Link>)}</nav>
    <div className="admin-split"><article className="admin-card"><div className="admin-card-head"><div><h2><Plus size={14} /> New {collection.replaceAll("_", " ")}</h2><p>Save as draft or publish immediately.</p></div></div><form action={saveCmsEntryAction} className="admin-form"><CmsFields collection={collection} /><div className="admin-form-actions"><button className="admin-primary-button">Create entry</button></div></form></article>
      <section>{entries.length ? entries.map((entry) => <details className="admin-list-card" key={entry.id}><summary><span className="admin-list-thumb" style={{display:"grid",placeItems:"center"}}><FileText size={18} /></span><div><b>{entry.title}</b><small>/{entry.slug} · Updated {new Date(entry.updated_at).toLocaleDateString("en-GB")}</small></div><span className={`admin-badge ${entry.status}`}>{entry.status}</span></summary><div className="admin-list-card-body"><form action={saveCmsEntryAction} className="admin-form"><CmsFields collection={collection} entry={entry} /><div className="admin-form-actions"><button className="admin-primary-button">Save changes</button></div></form><form action={deleteCmsEntryAction} className="admin-form-actions"><input type="hidden" name="id" value={entry.id} /><button className="admin-danger-button"><Trash2 size={13} />Delete entry</button></form></div></details>) : <div className="admin-card admin-empty"><FileText size={24} /><h3>No {collection.replaceAll("_", " ")} entries</h3><p>Create the first entry using the editor.</p></div>}</section></div></>;
}
