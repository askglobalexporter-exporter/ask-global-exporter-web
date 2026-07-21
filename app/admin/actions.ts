"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
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

async function adminCallbackUrl() {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host?.includes("localhost") ? "http" : "https");
  const baseUrl = origin ?? (host ? `${protocol}://${host}` : process.env.NEXT_PUBLIC_SITE_URL ?? "https://askglobalexport.com");
  return `${baseUrl.replace(/\/$/, "")}/admin/auth/callback?next=/admin/update-password`;
}

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
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: await adminCallbackUrl() });
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
  redirect("/admin/sections/hero?notice=slide-deleted");
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
  return updateInquiryStatusMutation({
    type: text(formData, "type") as "rfq" | "sample",
    id: text(formData, "id"),
    status: text(formData, "status"),
  });
}

export async function updateInquiryStatusMutation({ type, id, status }: { type:"rfq"|"sample";id:string;status:string }) {
  const session = await requireAdmin("inquiries.write");
  const { user, supabase } = session;
  const table = type === "sample" ? "sample_requests" : "quote_requests";
  const { error } = await supabase.from(table).update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  await supabase.from("inquiry_activity").insert({ inquiry_type: type, inquiry_id: Number(id), action: `Status changed to ${status}`, actor_id: user.id });
  await writeAudit("inquiry.status_updated", type, id, { status }, session);
  return { id, status };
}

export async function createMediaFolderAction(formData: FormData) {
  const { user, supabase } = await requireAdmin("media.write");
  const name = text(formData, "name");
  const parentId = text(formData, "parent_id") || null;
  if (!name) return;
  let duplicateQuery = supabase.from("media_folders").select("id").ilike("name", name);
  duplicateQuery = parentId ? duplicateQuery.eq("parent_id", parentId) : duplicateQuery.is("parent_id", null);
  const { data: duplicate } = await duplicateQuery.maybeSingle();
  if (duplicate) throw new Error("Nama folder sudah digunakan di lokasi ini.");
  const { error } = await supabase.from("media_folders").insert({ name, parent_id: parentId, created_by: user.id });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/media");
}

export async function registerMediaAssetAction(payload: {
  folder_id: string | null; filename: string; storage_path: string; public_url: string;
  mime_type: string; size_bytes: number; width?: number; height?: number; alt_text?: string;
  provider: "imagekit"; provider_file_id: string;
}) {
  return registerMediaAssetsAction([payload]);
}

export async function registerMediaAssetsAction(payloads: Array<{
  folder_id: string | null; filename: string; storage_path: string; public_url: string;
  mime_type: string; size_bytes: number; width?: number; height?: number; alt_text?: string;
  provider: "imagekit"; provider_file_id: string;
}>) {
  if (!payloads.length) return [];
  const session = await requireAdmin("media.write");
  const { user, supabase } = session;
  const { error } = await supabase.from("media_assets").insert(payloads.map((payload)=>({ ...payload, uploaded_by:user.id })));
  if (error) throw new Error(error.message);
  await writeAudit("media.uploaded", "media", undefined, { count:payloads.length, filenames:payloads.map((item)=>item.filename) }, session);
  return payloads.map((item)=>item.public_url);
}

export async function deleteMediaAssetAction(formData: FormData) {
  return deleteMediaAssetMutation({
    id:text(formData, "id"), storagePath:text(formData, "storage_path"),
    provider:text(formData, "provider"), providerFileId:text(formData, "provider_file_id"),
  });
}

export async function deleteMediaAssetMutation({ id, storagePath, provider, providerFileId }: { id:string;storagePath:string;provider:string;providerFileId:string }) {
  const session = await requireAdmin("media.write");
  const { supabase } = session;
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
  await writeAudit("media.deleted", "media", id, { storagePath, provider }, session);
  return { id };
}

export async function inviteAdminAction(formData: FormData) {
  await requireAdmin("team.write");
  const email = text(formData, "email").toLowerCase();
  const fullName = text(formData, "full_name");
  const role = text(formData, "role") as AdminRole;
  if (!["super_admin", "marketing", "content_editor"].includes(role)) throw new Error("Role administrator tidak valid.");
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error("Server administration key is not configured.");
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, { data: { full_name: fullName }, redirectTo: await adminCallbackUrl() });
  if (error) throw new Error(error.message);
  if (data.user) await admin.from("admin_profiles").upsert({ user_id: data.user.id, full_name: fullName, role, is_active: true });
  await writeAudit("admin.invited", "admin_profile", data.user?.id, { email, role });
  revalidatePath("/admin/team");
}

export async function updateAdminRoleAction(formData: FormData) {
  const { user } = await requireAdmin("team.write");
  const userId = text(formData, "user_id");
  const nextRole = text(formData, "role") as AdminRole;
  const nextActive = checked(formData, "is_active");
  if (!["super_admin", "marketing", "content_editor"].includes(nextRole)) throw new Error("Role administrator tidak valid.");
  if (userId === user.id && !nextActive) throw new Error("You cannot deactivate your own account.");
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error("Server administration key is not configured.");
  const { data:current } = await admin.from("admin_profiles").select("role,is_active").eq("user_id", userId).maybeSingle();
  if (current?.role === "super_admin" && current.is_active && (nextRole !== "super_admin" || !nextActive)) {
    const { count } = await admin.from("admin_profiles").select("user_id", { count:"exact", head:true }).eq("role", "super_admin").eq("is_active", true);
    if ((count ?? 0) <= 1) throw new Error("Super Admin terakhir harus tetap aktif dengan role Super Admin.");
  }
  const { error } = await admin.from("admin_profiles").update({ role:nextRole, is_active:nextActive, updated_at: new Date().toISOString() }).eq("user_id", userId);
  if (error) throw new Error(error.message);
  await writeAudit("admin.updated", "admin_profile", userId);
  revalidatePath("/admin/team");
}

export async function resendAdminPasswordMutation({ userId }: { userId:string }) {
  await requireAdmin("team.write");
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error("Server administration key is not configured.");
  const { data, error:userError } = await admin.auth.admin.getUserById(userId);
  const email = data.user?.email;
  if (userError || !email) throw new Error("Email administrator tidak ditemukan.");
  const { error } = await admin.auth.resetPasswordForEmail(email, { redirectTo: await adminCallbackUrl() });
  if (error) throw new Error(error.message);
  await writeAudit("admin.password_link_resent", "admin_profile", userId, { email });
  return { sent:true };
}

export async function deleteAdminMutation({ userId }: { userId:string }) {
  const { user } = await requireAdmin("team.write");
  if (userId === user.id) throw new Error("Akun yang sedang digunakan tidak dapat dihapus.");
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error("Server administration key is not configured.");
  const { data:target, error:targetError } = await admin.from("admin_profiles").select("role,full_name").eq("user_id", userId).maybeSingle();
  if (targetError || !target) throw new Error("Administrator tidak ditemukan.");
  if (target.role === "super_admin") {
    const { count } = await admin.from("admin_profiles").select("user_id", { count:"exact", head:true }).eq("role", "super_admin").eq("is_active", true);
    if ((count ?? 0) <= 1) throw new Error("Super Admin terakhir tidak dapat dihapus.");
  }
  const { data:authUser } = await admin.auth.admin.getUserById(userId);
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);
  await writeAudit("admin.deleted", "admin_profile", userId, { email:authUser.user?.email, role:target.role, fullName:target.full_name });
  revalidatePath("/admin/team");
  return { deleted:true };
}
