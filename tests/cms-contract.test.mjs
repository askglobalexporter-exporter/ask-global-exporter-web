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
    source("app/admin/(panel)/content/page.tsx"),
    source("components/admin/HomepageBuilder.tsx"),
    source("app/admin/(panel)/seo/page.tsx"),
  ]);
  assert.match(field, /uploadToImageKit/);
  assert.match(field, /registerMediaAssetAction/);
  assert.match(field, /type="file"/);
  assert.match(products, /name="gallery_images"/);
  assert.match(content, /name="featured_image_url"/);
  assert.match(homepage, /name="image_url"/);
  assert.match(seo, /name="og_image_url"/);
});
