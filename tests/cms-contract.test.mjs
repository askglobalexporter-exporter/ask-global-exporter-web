import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("admin authentication is scoped and deduplicated", async () => {
  const [proxy,auth,shell]=await Promise.all([source("proxy.ts"),source("lib/admin/auth.ts"),source("components/admin/AdminShell.tsx")]);
  assert.match(proxy,/matcher:\s*\["\/admin\/:path\*", "\/api\/admin\/:path\*"\]/);
  assert.match(auth,/cache\(async \(\) =>/);
  assert.match(shell,/roleCan\(profile\.role, item\.permission\)/);
});

test("published products and CMS entries drive public pages", async () => {
  const [content,home,productPage,vanilla]=await Promise.all([source("lib/public-content.ts"),source("app/page.tsx"),source("app/products/[slug]/page.tsx"),source("app/products/vanilla-beans/page.tsx")]);
  assert.match(content,/product_images\(image_url,alt_text,position\)/);
  assert.doesNotMatch(content,/!data\?\.length\) return fallbackProducts/);
  assert.match(home,/getPublishedCmsEntries\("faq"\)/);
  assert.match(productPage,/getPublishedCmsEntries\("export_document"\)/);
  assert.match(vanilla,/getSeoSetting\("\/products\/vanilla-beans"\)/);
});

test("public CMS routes and safe homepage visibility policy exist", async () => {
  const migration=await source("supabase/migrations/006_cms_public_contract.sql");
  assert.match(migration,/Public reads homepage layout/);
  assert.match(migration,/for select to anon using \(true\)/i);
  await Promise.all([access(new URL("app/about/page.tsx",root)),access(new URL("app/blog/page.tsx",root)),access(new URL("app/blog/[slug]/page.tsx",root))]);
});

test("admin image fields upload directly to ImageKit", async () => {
  const [field, products, content, homepage, seo] = await Promise.all([
    source("components/admin/ImageUploadField.tsx"),
    source("app/admin/(panel)/products/page.tsx"),
    source("components/admin/CmsEntryEditor.tsx"),
    source("components/admin/HeroSlideEditor.tsx"),
    source("app/admin/(panel)/seo/page.tsx"),
  ]);
  assert.match(field, /uploadToImageKit/);
  assert.match(field, /registerMediaAssetAction/);
  assert.match(field, /type="file"/);
  assert.match(products, /name="gallery_images"/);
  assert.match(content, /name="featured_image_url"/);
  assert.match(homepage, /name="image_url"/);
  assert.match(homepage, /name="mobile_image_url"/);
  assert.match(seo, /name="og_image_url"/);
});

test("company identity is editable once and reused by the public website", async () => {
  const [migration, mapsMigration, content, action, companyPage, layout, home, brandLogo] = await Promise.all([
    source("supabase/migrations/008_company_settings.sql"),
    source("supabase/migrations/012_company_maps_url.sql"),
    source("lib/public-content.ts"),
    source("app/admin/actions.ts"),
    source("app/admin/(panel)/company/page.tsx"),
    source("app/layout.tsx"),
    source("components/HomePage.tsx"),
    source("components/BrandLogo.tsx"),
  ]);
  assert.match(migration, /create table if not exists public\.company_settings/i);
  assert.match(migration, /for select to anon using \(true\)/i);
  assert.match(mapsMigration, /add column if not exists maps_url/i);
  assert.match(content, /getCompanySettings/);
  assert.match(action, /saveCompanySettingsAction/);
  assert.match(companyPage, /name="whatsapp_logo_url"/);
  assert.match(companyPage, /name="maps_url"/);
  assert.match(layout, /CompanySettingsProvider/);
  assert.match(home, /useCompanySettings/);
  assert.match(home, /google\.com\/maps\/search/);
  assert.match(brandLogo, /company\.brand_name\.trim\(\)\.split/);
  assert.doesNotMatch(brandLogo, />ASK</);
});

test("core editors include a required live preview", async () => {
  const [preview, products, content, homepage, seo, company] = await Promise.all([
    source("components/admin/AdminLivePreview.tsx"),
    source("app/admin/(panel)/products/page.tsx"),
    source("components/admin/CmsEntryEditor.tsx"),
    source("components/admin/HomepageSectionEditor.tsx"),
    source("app/admin/(panel)/seo/page.tsx"),
    source("app/admin/(panel)/company/page.tsx"),
  ]);
  assert.match(preview, /Preview langsung/);
  assert.match(preview, /admin-preview-refresh/);
  for (const editor of [products, content, homepage, seo, company]) {
    assert.match(editor, /AdminLivePreview/);
  }
});

test("content creation and editing are separate, client-friendly workflows", async () => {
  const [list, create, edit, editor] = await Promise.all([
    source("app/admin/(panel)/content/page.tsx"),
    source("app/admin/(panel)/content/new/page.tsx"),
    source("app/admin/(panel)/content/[id]/edit/page.tsx"),
    source("components/admin/CmsEntryEditor.tsx"),
  ]);
  assert.match(list, /Tambah \{cmsCollectionLabels\[collection\]\}/);
  assert.match(list, /\/admin\/content\/\$\{entry\.id\}\/edit/);
  assert.match(create, /mode="create"/);
  assert.match(edit, /mode="edit"/);
  assert.match(editor, /Konten yang sedang tayang|Edit/);
  assert.match(editor, /Preview tampilan publik/);
});

test("homepage sections have visual editors and a responsive multi-slide hero", async () => {
  const [migration, mobileMigration, publicContent, homepage, sectionList, heroList, heroEditor, preview, styles] = await Promise.all([
    source("supabase/migrations/010_homepage_hero_slides.sql"),
    source("supabase/migrations/011_hero_mobile_controls.sql"),
    source("lib/public-content.ts"),
    source("components/HomePage.tsx"),
    source("app/admin/(panel)/sections/page.tsx"),
    source("app/admin/(panel)/sections/hero/page.tsx"),
    source("components/admin/HeroSlideEditor.tsx"),
    source("components/admin/AdminLivePreview.tsx"),
    source("app/globals.css"),
  ]);
  assert.match(migration, /create table if not exists public\.homepage_hero_slides/i);
  assert.match(mobileMigration, /mobile_image_url/);
  assert.match(publicContent, /getHomepageHeroSlides/);
  assert.match(homepage, /heroSlides/);
  assert.match(homepage, /--hero-mobile-image/);
  assert.match(homepage, /setInterval/);
  assert.match(sectionList, /HomepageBuilder/);
  assert.match(heroList, /Tambah slide/);
  assert.match(heroEditor, /Live preview hero/);
  assert.match(heroEditor, /Foto mobile/);
  assert.match(preview, /admin-preview-device-switch/);
  assert.match(styles, /min-height:100svh!important/);
});

test("admin performance stays bounded as client data grows", async () => {
  const [migration, dashboard, products, content, inquiries, lazyDetails] = await Promise.all([
    source("supabase/migrations/009_admin_performance.sql"),
    source("app/admin/(panel)/page.tsx"),
    source("app/admin/(panel)/products/page.tsx"),
    source("app/admin/(panel)/content/page.tsx"),
    source("app/admin/(panel)/inquiries/page.tsx"),
    source("components/admin/AdminLazyDetails.tsx"),
  ]);
  assert.match(migration, /admin_dashboard_analytics/);
  assert.match(migration, /count\(distinct visitor_hash\)/i);
  assert.match(dashboard, /supabase\.rpc\("admin_dashboard_analytics"/);
  assert.doesNotMatch(dashboard, /from\("site_events"\)/);
  for (const page of [products, content, inquiries]) assert.match(page, /\.range\(/);
  assert.match(products, /AdminLazyDetails/);
  assert.doesNotMatch(content, /<form/);
  assert.match(lazyDetails, /open \? children : null/);
});

test("public inquiries include privacy, durable spam protection, and email alerts", async () => {
  const [privacy, migration, server, notification, quotation, sample, env] = await Promise.all([
    source("app/privacy/page.tsx"), source("supabase/migrations/013_inquiry_protection.sql"), source("lib/inquiry-server.ts"),
    source("lib/inquiry-notification.ts"), source("app/api/quotation/route.ts"), source("app/api/sample/route.ts"), source(".env.example"),
  ]);
  assert.match(privacy, /Privacy Policy/);
  assert.match(migration, /consume_inquiry_rate_limit/);
  assert.match(migration, /service_role/);
  assert.match(server, /siteverify/);
  assert.match(notification, /api\.resend\.com\/emails/);
  for (const route of [quotation, sample]) {
    assert.match(route, /verifyTurnstile/);
    assert.match(route, /sendInquiryNotification/);
  }
  assert.match(env, /TURNSTILE_SECRET_KEY/);
  assert.match(env, /RESEND_API_KEY/);
});

test("buyer testimonials are moderated before the latest three appear publicly", async () => {
  const [route, form, page, homepage, contentList, editor] = await Promise.all([
    source("app/api/testimonials/route.ts"),
    source("components/TestimonialForm.tsx"),
    source("app/testimonials/page.tsx"),
    source("components/HomePage.tsx"),
    source("app/admin/(panel)/content/page.tsx"),
    source("components/admin/CmsEntryEditor.tsx"),
  ]);
  assert.match(route, /collection: "testimonial"/);
  assert.match(route, /status: "draft"/);
  assert.match(route, /verifyTurnstile/);
  assert.match(route, /isRateLimited\("testimonial"/);
  assert.match(form, /publication|reviewed before publication/i);
  assert.match(page, /getPublishedCmsEntries\("testimonial"\)/);
  assert.match(homepage, /testimonials\.slice\(0,3\)/);
  assert.match(contentList, /Menunggu review/);
  assert.match(editor, /Terbit — tampil di website/);
  assert.match(editor, /Arsip — tidak tampil/);
});
