"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/inquiry-server";
import { requireAdmin, writeAudit } from "@/lib/admin/auth";
import type { AdminRole } from "@/lib/admin/types";

export type LoginState = { error?: string };
export type PasswordState = { error?: string; success?: string };

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();
const checked = (formData: FormData, key: string) => formData.get(key) === "on" || formData.get(key) === "true";
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function list(value: string) {
  return value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
}

function specs(value: string) {
  return value.split(/\r?\n/).map((row) => {
    const [label, ...rest] = row.split(":");
    return { label: label?.trim(), value: rest.join(":").trim() };
  }).filter((row) => row.label && row.value);
}

function revalidateCmsCollection(collection: string) {
  revalidatePath("/admin/content");
  if (["homepage", "faq", "testimonial", "export_document", "company_profile"].includes(collection)) revalidatePath("/");
  if (["about", "testimonial", "company_profile"].includes(collection)) revalidatePath("/about");
  if (collection === "blog") revalidatePath("/blog");
  if (["faq", "export_document"].includes(collection)) {
    revalidatePath("/products/vanilla-beans");
    revalidatePath("/products/[slug]", "page");
  }
}

export async function loginAction(_: LoginState, formData: FormData): Promise<LoginState> {
  const email = text(formData, "email").toLowerCase();
  const password = text(formData, "password");
  if (!email || !password) return { error: "Enter your email and password." };
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: "Email or password is incorrect." };
  const { data: profile } = await supabase.from("admin_profiles").select("is_active").eq("user_id", data.user.id).maybeSingle();
  if (!profile?.is_active) {
    await supabase.auth.signOut();
    return { error: "This account has not been activated by a Super Admin." };
  }
  await supabase.from("admin_profiles").update({ last_seen_at: new Date().toISOString() }).eq("user_id", data.user.id);
  redirect("/admin");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function requestPasswordResetAction(_: PasswordState, formData: FormData): Promise<PasswordState> {
  const email = text(formData, "email").toLowerCase();
  if (!email) return { error: "Enter your administrator email." };
  const supabase = await createSupabaseServerClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.askglobalexport.com";
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${siteUrl}/admin/auth/callback?next=/admin/update-password` });
  if (error) return { error: "We could not send a password link. Please contact your Super Admin." };
  return { success: "Check your inbox for a secure password setup link." };
}

export async function saveProductAction(formData: FormData) {
  const { user, supabase } = await requireAdmin("products.write");
  const id = text(formData, "id");
  const name = text(formData, "name");
  const payload = {
    name,
    slug: slugify(text(formData, "slug") || name),
    category: text(formData, "category") || "Agricultural Commodities",
    short_description: text(formData, "short_description"),
    description: text(formData, "description"),
    origin: text(formData, "origin") || "Indonesia",
    status: text(formData, "status") || "draft",
    is_featured: checked(formData, "is_featured"),
    position: Number(text(formData, "position") || 0),
    specifications: specs(text(formData, "specifications")),
    grades: list(text(formData, "grades")),
    packaging_options: list(text(formData, "packaging_options")),
    moq: text(formData, "moq"),
    lead_time: text(formData, "lead_time"),
    incoterms: list(text(formData, "incoterms")),
    primary_image_url: text(formData, "primary_image_url") || null,
    seo_title: text(formData, "seo_title") || null,
    seo_description: text(formData, "seo_description") || null,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  };
  const query = id
    ? supabase.from("products").update(payload).eq("id", id).select("id").single()
    : supabase.from("products").insert({ ...payload, created_by: user.id }).select("id").single();
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const galleryImages = list(text(formData, "gallery_images"));
  const { error: deleteImagesError } = await supabase.from("product_images").delete().eq("product_id", data.id);
  if (deleteImagesError) throw new Error(deleteImagesError.message);
  if (galleryImages.length) {
    const { error: galleryError } = await supabase.from("product_images").insert(galleryImages.map((imageUrl, position) => ({
      product_id: data.id,
      image_url: imageUrl,
      alt_text: `${name} product image ${position + 1}`,
      position,
    })));
    if (galleryError) throw new Error(galleryError.message);
  }
  await writeAudit(id ? "product.updated" : "product.created", "product", data.id, { name });
  revalidatePath("/admin/products"); revalidatePath("/"); revalidatePath(`/products/${payload.slug}`); revalidatePath("/products/vanilla-beans");
}

export async function deleteProductAction(formData: FormData) {
  const { supabase } = await requireAdmin("products.write");
  const id = text(formData, "id");
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await writeAudit("product.deleted", "product", id);
  revalidatePath("/admin/products"); revalidatePath("/"); revalidatePath("/products/vanilla-beans");
}

export async function saveCmsEntryAction(formData: FormData) {
  const { user, profile, supabase } = await requireAdmin("dashboard.read");
  const collection = text(formData, "collection");
  const allowed = profile.role === "super_admin" || profile.role === "content_editor"
    || (profile.role === "marketing" && ["blog", "testimonial"].includes(collection));
  if (!allowed) throw new Error("You do not have permission to edit this collection.");
  const id = text(formData, "id");
  const title = text(formData, "title");
  const status = text(formData, "status") || "draft";
  const payload = {
    collection,
    slug: slugify(text(formData, "slug") || title),
    title,
    excerpt: text(formData, "excerpt") || null,
    content: {
      body: text(formData, "body"),
      question: collection === "faq" ? title : "",
      answer: collection === "faq" ? text(formData, "body") : "",
      author: collection === "testimonial" ? title : "",
      company: text(formData, "company"),
      role: text(formData, "role"),
      cta_label: text(formData, "cta_label"),
      cta_url: text(formData, "cta_url"),
    },
    status,
    featured_image_url: text(formData, "featured_image_url") || null,
    published_at: status === "published" ? new Date().toISOString() : null,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  };
  const query = id
    ? supabase.from("cms_entries").update(payload).eq("id", id).select("id").single()
    : supabase.from("cms_entries").insert({ ...payload, created_by: user.id }).select("id").single();
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  await writeAudit(id ? "content.updated" : "content.created", collection, data.id, { title });
  revalidateCmsCollection(collection);
  const redirectTo = text(formData, "redirect_to").replace(":id", data.id);
  if (redirectTo.startsWith("/admin/content")) redirect(redirectTo);
}

export async function deleteCmsEntryAction(formData: FormData) {
  const { profile, supabase } = await requireAdmin("content.read");
  const id = text(formData, "id");
  const collection = text(formData, "collection");
  const allowed = profile.role === "super_admin" || profile.role === "content_editor"
    || (profile.role === "marketing" && ["blog", "testimonial"].includes(collection));
  if (!allowed) throw new Error("You do not have permission to delete this entry.");
  const { error } = await supabase.from("cms_entries").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await writeAudit("content.deleted", "cms_entry", id);
  revalidateCmsCollection(collection);
  const redirectTo = text(formData, "redirect_to");
  if (redirectTo.startsWith("/admin/content")) redirect(redirectTo);
}

export async function saveSeoAction(formData: FormData) {
  const { user, supabase } = await requireAdmin("seo.write");
  const route = text(formData, "route") || "/";
  const payload = {
    route,
    meta_title: text(formData, "meta_title"),
    meta_description: text(formData, "meta_description"),
    canonical_url: text(formData, "canonical_url") || null,
    keywords: list(text(formData, "keywords")),
    og_image_url: text(formData, "og_image_url") || null,
    robots: text(formData, "robots") || "index,follow",
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("seo_settings").upsert(payload, { onConflict: "route" });
  if (error) throw new Error(error.message);
  await writeAudit("seo.updated", "seo", route);
  revalidatePath("/admin/seo"); revalidatePath(route);
}

export async function saveHomepageSectionsAction(formData: FormData) {
  const { user, supabase } = await requireAdmin("homepage.write");
  const raw = text(formData, "sections");
  const sections = JSON.parse(raw) as Array<{ id: string; position: number; is_visible: boolean }>;
  const updates = sections.map((section) => supabase.from("homepage_sections").update({ position: section.position, is_visible: section.is_visible, updated_by: user.id, updated_at: new Date().toISOString() }).eq("id", section.id));
  const results = await Promise.all(updates);
  const error = results.find((result) => result.error)?.error;
  if (error) throw new Error(error.message);
  await writeAudit("homepage.reordered", "homepage", undefined, { count: sections.length });
  revalidatePath("/admin/sections"); revalidatePath("/");
}

export async function saveHomepageSectionContentAction(formData: FormData) {
  const { user, supabase } = await requireAdmin("homepage.write");
  const id = text(formData, "id");
  const sectionKey = text(formData, "section_key");
  const content = {
    title: text(formData, "title"),
    eyebrow: text(formData, "eyebrow"),
    summary: text(formData, "summary"),
    body: text(formData, "body"),
    cta_label: text(formData, "cta_label"),
    cta_url: text(formData, "cta_url"),
    image_url: text(formData, "image_url"),
  };
  const { error } = await supabase.from("homepage_sections").update({ content, updated_by: user.id, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(error.message);
  await writeAudit("homepage.content_updated", "homepage_section", id, { sectionKey });
  revalidatePath("/admin/sections"); revalidatePath("/");
  const redirectTo = text(formData, "redirect_to");
  if (redirectTo.startsWith("/admin/sections/")) redirect(redirectTo);
}

export async function saveHeroSlideAction(formData: FormData) {
  const { user, supabase } = await requireAdmin("homepage.write");
  const id = text(formData, "id");
  const payload = {
    eyebrow: text(formData, "eyebrow"),
    title: text(formData, "title"),
    summary: text(formData, "summary"),
    image_url: text(formData, "image_url"),
    mobile_image_url: text(formData, "mobile_image_url") || null,
    desktop_position: text(formData, "desktop_position") || "center right",
    mobile_position: text(formData, "mobile_position") || "center center",
    cta_label: text(formData, "cta_label") || "Request quotation",
    cta_url: text(formData, "cta_url") || "/products/vanilla-beans#quotation",
    position: Number(text(formData, "position") || 0),
    is_visible: checked(formData, "is_visible"),
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  };
  if (!payload.title || !payload.image_url) throw new Error("Judul dan foto slide wajib diisi.");
  const result = id
    ? await supabase.from("homepage_hero_slides").update(payload).eq("id", id).select("id").single()
    : await supabase.from("homepage_hero_slides").insert(payload).select("id").single();
  if (result.error) throw new Error(result.error.message);
  await writeAudit(id ? "hero_slide.updated" : "hero_slide.created", "homepage_hero_slide", result.data.id, { title: payload.title });
  revalidatePath("/admin/sections/hero");
  revalidatePath("/");
  redirect(`/admin/sections/hero/${result.data.id}/edit?saved=${id ? "updated" : "created"}`);
}

export async function deleteHeroSlideAction(formData: FormData) {
  const { supabase } = await requireAdmin("homepage.write");
  const id = text(formData, "id");
  const { error } = await supabase.from("homepage_hero_slides").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await writeAudit("hero_slide.deleted", "homepage_hero_slide", id);
  revalidatePath("/admin/sections/hero");
  revalidatePath("/");
  redirect("/admin/sections/hero");
}

export async function saveCompanySettingsAction(formData: FormData) {
  const { user, supabase } = await requireAdmin("homepage.write");
  const whatsappNumber = text(formData, "whatsapp_number").replace(/\D/g, "");
  const payload = {
    singleton: true,
    brand_name: text(formData, "brand_name") || "Ask Global",
    legal_name: text(formData, "legal_name") || "ASK Global",
    tagline: text(formData, "tagline"),
    description: text(formData, "description"),
    email: text(formData, "email").toLowerCase(),
    whatsapp_number: whatsappNumber,
    whatsapp_display: text(formData, "whatsapp_display"),
    address: text(formData, "address"),
    maps_url: text(formData, "maps_url"),
    service_area: text(formData, "service_area"),
    business_hours: text(formData, "business_hours"),
    logo_url: text(formData, "logo_url") || null,
    whatsapp_logo_url: text(formData, "whatsapp_logo_url") || null,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("company_settings").upsert(payload, { onConflict: "singleton" });
  if (error) throw new Error(error.message);
  await writeAudit("company.settings_updated", "company_settings", undefined, { brandName: payload.brand_name });
  revalidatePath("/admin/company");
  revalidatePath("/", "layout");
}

export async function updateInquiryStatusAction(formData: FormData) {
  const { user, supabase } = await requireAdmin("inquiries.write");
  const type = text(formData, "type") as "rfq" | "sample";
  const id = text(formData, "id");
  const status = text(formData, "status");
  const table = type === "sample" ? "sample_requests" : "quote_requests";
  const { error } = await supabase.from(table).update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  await supabase.from("inquiry_activity").insert({ inquiry_type: type, inquiry_id: Number(id), action: `Status changed to ${status}`, actor_id: user.id });
  await writeAudit("inquiry.status_updated", type, id, { status });
  revalidatePath("/admin/inquiries"); revalidatePath("/admin");
}

export async function createMediaFolderAction(formData: FormData) {
  const { user, supabase } = await requireAdmin("media.write");
  const name = text(formData, "name");
  if (!name) return;
  const { error } = await supabase.from("media_folders").insert({ name, created_by: user.id });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/media");
}

export async function registerMediaAssetAction(payload: {
  folder_id: string | null; filename: string; storage_path: string; public_url: string;
  mime_type: string; size_bytes: number; width?: number; height?: number; alt_text?: string;
  provider: "imagekit"; provider_file_id: string;
}) {
  const { user, supabase } = await requireAdmin("media.write");
  const { error } = await supabase.from("media_assets").insert({ ...payload, uploaded_by: user.id });
  if (error) throw new Error(error.message);
  await writeAudit("media.uploaded", "media", payload.storage_path, { filename: payload.filename });
  revalidatePath("/admin/media");
}

export async function deleteMediaAssetAction(formData: FormData) {
  const { supabase } = await requireAdmin("media.write");
  const id = text(formData, "id");
  const storagePath = text(formData, "storage_path");
  const provider = text(formData, "provider");
  const providerFileId = text(formData, "provider_file_id");
  if (provider === "imagekit" && providerFileId) {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!privateKey) throw new Error("ImageKit private key is not configured.");
    const response = await fetch(`https://api.imagekit.io/v1/files/${encodeURIComponent(providerFileId)}`, {
      method: "DELETE",
      headers: { Authorization: `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}` },
    });
    if (!response.ok && response.status !== 404) throw new Error("The asset could not be deleted from ImageKit.");
  } else {
    await supabase.storage.from("media").remove([storagePath]);
  }
  const { error } = await supabase.from("media_assets").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await writeAudit("media.deleted", "media", id, { storagePath, provider });
  revalidatePath("/admin/media");
}

export async function inviteAdminAction(formData: FormData) {
  await requireAdmin("team.write");
  const email = text(formData, "email").toLowerCase();
  const fullName = text(formData, "full_name");
  const role = text(formData, "role") as AdminRole;
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error("Server administration key is not configured.");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.askglobalexport.com";
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, { data: { full_name: fullName }, redirectTo: `${siteUrl}/admin/auth/callback?next=/admin/update-password` });
  if (error) throw new Error(error.message);
  if (data.user) await admin.from("admin_profiles").upsert({ user_id: data.user.id, full_name: fullName, role, is_active: true });
  await writeAudit("admin.invited", "admin_profile", data.user?.id, { email, role });
  revalidatePath("/admin/team");
}

export async function updateAdminRoleAction(formData: FormData) {
  const { user } = await requireAdmin("team.write");
  const userId = text(formData, "user_id");
  if (userId === user.id && !checked(formData, "is_active")) throw new Error("You cannot deactivate your own account.");
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error("Server administration key is not configured.");
  const { error } = await admin.from("admin_profiles").update({ role: text(formData, "role"), is_active: checked(formData, "is_active"), updated_at: new Date().toISOString() }).eq("user_id", userId);
  if (error) throw new Error(error.message);
  await writeAudit("admin.updated", "admin_profile", userId);
  revalidatePath("/admin/team");
}
