-- Complete the public CMS contract used by the Next.js application.

-- Public clients need the full layout list so a hidden section remains hidden.
drop policy if exists "Public reads visible homepage sections" on public.homepage_sections;
drop policy if exists "Public reads homepage layout" on public.homepage_sections;
create policy "Public reads homepage layout" on public.homepage_sections
for select to anon using (true);

insert into public.homepage_sections (section_key, label, section_type, position, is_visible, content)
values
  ('hero','Hero','hero',0,true,'{"eyebrow":"Premium Indonesian vanilla","title":"Vanilla Beans","summary":"Natural, aromatic, and export-ready—sourced with care in Indonesia.","cta_label":"Request quotation","cta_url":"/products/vanilla-beans#quotation","image_url":"/vanilla-grade-a.webp"}'::jsonb),
  ('about','Who we are','content',1,true,'{"title":"From the heart of Indonesia, to businesses worldwide."}'::jsonb),
  ('products','Products','products',2,true,'{"title":"Indonesian vanilla, prepared for B2B buyers.","summary":"Explore whole-bean grades and processed formats. Final specifications and commercial availability are confirmed per lot and quotation."}'::jsonb),
  ('focus','Our focus','features',3,true,'{"title":"Indonesian supply, built for global business.","summary":"Our sourcing network and trading capabilities support buyers across six core areas."}'::jsonb),
  ('process','Export process','timeline',4,true,'{"title":"From supplier sourcing to international shipping."}'::jsonb),
  ('compliance','Compliance','documents',5,true,'{"title":"Documentation that supports each shipment.","summary":"Availability depends on destination rules, shipment type, and agreement. We confirm the required document set before order finalization."}'::jsonb),
  ('testimonials','Testimonials','testimonials',6,false,'{"title":"Partnerships built on reliable execution.","summary":"Selected feedback from buyers and commercial partners."}'::jsonb),
  ('faq','Buyer FAQ','faq',7,true,'{"title":"Questions global buyers ask before sourcing."}'::jsonb),
  ('blog','Trade insights','blog',8,true,'{"title":"Insights for responsible sourcing."}'::jsonb),
  ('contact','Contact','contact',9,true,'{"title":"Ready to source from Indonesia?","summary":"Share your product, specification, quantity, packaging, and destination. Our team will respond with availability and the next sourcing steps."}'::jsonb)
on conflict (section_key) do update set
  position = excluded.position,
  content = case when homepage_sections.content = '{}'::jsonb then excluded.content else homepage_sections.content end;

insert into public.cms_entries (collection, slug, title, excerpt, content, status, published_at)
values
  ('faq','minimum-order','What is the minimum order quantity?',null,'{"body":"MOQ depends on product grade, packaging, lot availability, and destination. It is confirmed with the quotation."}'::jsonb,'published',now()),
  ('faq','lead-time','How long does an export order take?',null,'{"body":"Lead time is confirmed with the quotation and depends on lot availability, volume, packaging, documentation, and destination."}'::jsonb,'published',now()),
  ('faq','private-label','Can you support private-label packaging?',null,'{"body":"Private-label packaging, buyer labels, carton markings, and custom inner pack sizes can be discussed for qualified orders."}'::jsonb,'published',now()),
  ('export_document','commercial-invoice','Commercial Invoice','Standard commercial shipment document.','{"body":"Prepared for each confirmed commercial shipment."}'::jsonb,'published',now()),
  ('export_document','packing-list','Packing List','Standard packing and shipment detail.','{"body":"Prepared for each confirmed commercial shipment."}'::jsonb,'published',now()),
  ('export_document','certificate-of-origin','Certificate of Origin','Arranged when required for the shipment.','{"body":"Availability is confirmed against destination and shipment requirements."}'::jsonb,'published',now()),
  ('export_document','phytosanitary-certificate','Phytosanitary Certificate','Arranged when required for plant-based commodities.','{"body":"Availability is confirmed against destination and shipment requirements."}'::jsonb,'published',now()),
  ('export_document','fumigation-certificate','Fumigation Certificate','Arranged when required.','{"body":"Availability is confirmed against destination and shipment requirements."}'::jsonb,'published',now())
on conflict (collection, slug) do nothing;

insert into public.seo_settings (route, meta_title, meta_description, canonical_url, keywords)
values
  ('/about','About Ask Global | Indonesian Trading Company','Learn how Ask Global connects international buyers with dependable Indonesian commodity sourcing partners.','https://www.askglobalexport.com/about',array['Ask Global','Indonesian trading company','commodity sourcing Indonesia']),
  ('/blog','Trade Insights | Ask Global','Practical insights about Indonesian commodities, export readiness, and specification-led global sourcing.','https://www.askglobalexport.com/blog',array['Indonesian commodities','export insights','global sourcing']),
  ('/products/vanilla-beans','Indonesian Vanilla Beans Exporter & Wholesale Supplier','Source Indonesian Vanilla planifolia for B2B requirements with export-ready packaging and documentation support.','https://www.askglobalexport.com/products/vanilla-beans',array['Indonesian vanilla beans','vanilla bean exporter','bulk vanilla supplier'])
on conflict (route) do nothing;

insert into public.product_images (product_id, image_url, alt_text, position)
select p.id, p.primary_image_url, p.name || ' product image', 0
from public.products p
where p.primary_image_url is not null
  and not exists (select 1 from public.product_images pi where pi.product_id = p.id);
