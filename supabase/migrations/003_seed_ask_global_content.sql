insert into public.products (
  slug, name, category, short_description, description, origin, status, is_featured, position,
  specifications, grades, packaging_options, moq, lead_time, incoterms, primary_image_url, seo_title, seo_description
) values
(
  'grade-a-vanilla-beans', 'Grade A Vanilla Beans', 'Whole Vanilla Beans',
  'Premium whole Indonesian vanilla beans selected for appearance, flexibility, aroma, and buyer-specific requirements.',
  'Premium gourmet-grade vanilla prepared for culinary, hospitality, retail, and specialty ingredient buyers.',
  'Indonesia', 'published', true, 1,
  '[{"label":"Botanical name","value":"Vanilla planifolia"},{"label":"Length","value":"Confirmed against buyer specification"},{"label":"Moisture","value":"Confirmed per approved lot"},{"label":"Application","value":"Premium culinary, pastry, hospitality, retail"}]'::jsonb,
  '["Premium / Gourmet Grade A"]'::jsonb,
  '["Vacuum-sealed inner packs","Food-grade export cartons","Custom pack sizes upon agreement"]'::jsonb,
  'Available upon request', 'Confirmed with quotation', array['EXW','FOB','CFR','CIF','DAP'], '/vanilla-grade-a.png',
  'Grade A Vanilla Beans Indonesia | Premium Export Supplier',
  'Source premium Grade A Indonesian vanilla beans with buyer-specific sorting, vacuum packaging, samples, and export documentation support.'
),
(
  'grade-b-vanilla-beans', 'Grade B Vanilla Beans', 'Extraction Vanilla Beans',
  'Extraction-focused whole vanilla beans supplied to ingredient processors and manufacturers against agreed specifications.',
  'Indonesian extraction-grade vanilla beans for flavor houses, extract producers, and food ingredient manufacturers.',
  'Indonesia', 'published', true, 2,
  '[{"label":"Botanical name","value":"Vanilla planifolia"},{"label":"Length","value":"Confirmed against buyer specification"},{"label":"Moisture","value":"Confirmed per approved lot"},{"label":"Application","value":"Vanilla extract, paste, flavor manufacturing"}]'::jsonb,
  '["Extraction Grade B"]'::jsonb,
  '["Vacuum-sealed bulk packs","Food-grade export cartons","Custom industrial packaging"]'::jsonb,
  'Available upon request', 'Confirmed with quotation', array['EXW','FOB','CFR','CIF','DAP'], '/vanilla-grade-b.png',
  'Grade B Vanilla Beans Indonesia | Extraction Grade Supplier',
  'Indonesian Grade B vanilla beans for extraction and manufacturing, supplied with editable specifications and export support.'
),
(
  'vanilla-cuts', 'Vanilla Cuts', 'Processed Vanilla',
  'Cut cured vanilla bean material prepared for extraction, milling, and industrial ingredient applications.',
  'Custom-sized cured vanilla material for extraction, milling, and industrial processing requirements.',
  'Indonesia', 'published', false, 3,
  '[{"label":"Botanical name","value":"Vanilla planifolia"},{"label":"Cut size","value":"Custom cut size"},{"label":"Moisture","value":"Confirmed per approved lot"},{"label":"Application","value":"Extraction, milling, industrial processing"}]'::jsonb,
  '["Cut Vanilla / Extraction Material"]'::jsonb,
  '["Vacuum-sealed bulk packs","Food-grade liner and carton","Custom cut and pack specification"]'::jsonb,
  'Available upon request', 'Confirmed with quotation', array['EXW','FOB','CFR','CIF','DAP'], '/vanilla-cuts.png',
  'Vanilla Cuts Indonesia | Bulk Extraction Supplier',
  'Source Indonesian vanilla cuts for extraction and industrial applications with custom sizing and export-ready packaging.'
),
(
  'vanilla-powder', 'Vanilla Powder', 'Processed Vanilla',
  'Ground vanilla material for dry applications, subject to confirmed availability and buyer specification.',
  'Indonesian ground vanilla for dry blends, bakery, and food manufacturing applications.',
  'Indonesia', 'draft', false, 4,
  '[{"label":"Form","value":"Fine ground vanilla material"},{"label":"Mesh size","value":"Confirmed per specification"},{"label":"Moisture","value":"Confirmed per approved lot"},{"label":"Application","value":"Dry blends, bakery, food manufacturing"}]'::jsonb,
  '["Ground Vanilla — availability to be confirmed"]'::jsonb,
  '["Food-grade sealed inner packs","Export carton","Custom pack sizes upon agreement"]'::jsonb,
  'Available upon request', 'Confirmed with quotation', array['EXW','FOB','CFR','CIF','DAP'], '/vanilla-powder.png',
  'Vanilla Powder Indonesia | Bulk Vanilla Ingredient',
  'Indonesian vanilla powder for B2B ingredient applications, subject to confirmed availability and buyer specification.'
)
on conflict (slug) do nothing;

insert into public.cms_entries (collection, slug, title, excerpt, content, status, published_at)
values
('about','company-overview','ASK Global — Indonesian sourcing for global business','An Indonesian trading company connecting global buyers with premium Indonesian commodities.','{"body":"We work closely with trusted farmers, processors, and local suppliers across Indonesia to ensure consistent quality, reliable supply, and products that meet international market expectations."}'::jsonb,'published',now()),
('company_profile','company-principle','Long-term partnerships, earned','Consistency, transparency, and reliable execution—not one-off transactions.','{"body":"ASK Global serves manufacturers, flavor houses, extract producers, food ingredient companies, distributors, and importers seeking dependable sourcing partners from Indonesia."}'::jsonb,'published',now()),
('faq','samples','Can we request a sample before ordering?',null,'{"body":"Yes. Sample availability is subject to approval, and shipping fees may apply. Specifications are confirmed before dispatch."}'::jsonb,'published',now()),
('faq','incoterms','Which Incoterms are available?',null,'{"body":"EXW, FOB, CFR, CIF, and DAP may be discussed. The final term depends on the destination, shipment size, and agreement."}'::jsonb,'published',now())
on conflict (collection, slug) do nothing;
