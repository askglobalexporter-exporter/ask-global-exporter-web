-- Ensure a useful Buyer FAQ is available in the CMS without overwriting owner edits.

insert into public.cms_entries (collection, slug, title, excerpt, content, status, published_at)
values
  (
    'faq', 'minimum-order', 'What is the minimum order quantity?', null,
    jsonb_build_object(
      'question', 'What is the minimum order quantity?',
      'answer', 'MOQ depends on product grade, packaging, lot availability, and destination. The confirmed MOQ will be included in our quotation.',
      'body', 'MOQ depends on product grade, packaging, lot availability, and destination. The confirmed MOQ will be included in our quotation.'
    ), 'published', now()
  ),
  (
    'faq', 'samples', 'Can we request a sample before placing a bulk order?', null,
    jsonb_build_object(
      'question', 'Can we request a sample before placing a bulk order?',
      'answer', 'Yes. Samples are available for qualified buyers, subject to approval and product availability. Sample and courier charges may apply.',
      'body', 'Yes. Samples are available for qualified buyers, subject to approval and product availability. Sample and courier charges may apply.'
    ), 'published', now() - interval '1 minute'
  ),
  (
    'faq', 'custom-specifications', 'Can product specifications be customized?', null,
    jsonb_build_object(
      'question', 'Can product specifications be customized?',
      'answer', 'Yes. Sorting, moisture range, bean length, packaging, and other requirements can be discussed and confirmed against an approved lot or sample.',
      'body', 'Yes. Sorting, moisture range, bean length, packaging, and other requirements can be discussed and confirmed against an approved lot or sample.'
    ), 'published', now() - interval '2 minutes'
  ),
  (
    'faq', 'export-documents', 'Which export documents can you provide?', null,
    jsonb_build_object(
      'question', 'Which export documents can you provide?',
      'answer', 'Commercial Invoice and Packing List are standard. Certificate of Origin, Phytosanitary Certificate, Fumigation Certificate, and other documents can be arranged when required.',
      'body', 'Commercial Invoice and Packing List are standard. Certificate of Origin, Phytosanitary Certificate, Fumigation Certificate, and other documents can be arranged when required.'
    ), 'published', now() - interval '3 minutes'
  ),
  (
    'faq', 'private-label', 'What packaging options are available?', null,
    jsonb_build_object(
      'question', 'What packaging options are available?',
      'answer', 'Products can be supplied in vacuum-sealed food-grade inner packs and export cartons. Custom pack sizes, buyer labels, and private-label packaging can be discussed.',
      'body', 'Products can be supplied in vacuum-sealed food-grade inner packs and export cartons. Custom pack sizes, buyer labels, and private-label packaging can be discussed.'
    ), 'published', now() - interval '4 minutes'
  ),
  (
    'faq', 'lead-time', 'How long does an export order take?', null,
    jsonb_build_object(
      'question', 'How long does an export order take?',
      'answer', 'Lead time depends on product availability, volume, packaging, documentation, and destination. The confirmed timeline will be stated in the quotation.',
      'body', 'Lead time depends on product availability, volume, packaging, documentation, and destination. The confirmed timeline will be stated in the quotation.'
    ), 'published', now() - interval '5 minutes'
  ),
  (
    'faq', 'incoterms', 'Which Incoterms are available?', null,
    jsonb_build_object(
      'question', 'Which Incoterms are available?',
      'answer', 'EXW, FOB, CFR, CIF, and DAP may be discussed. The final Incoterm depends on the shipment, destination, and commercial agreement.',
      'body', 'EXW, FOB, CFR, CIF, and DAP may be discussed. The final Incoterm depends on the shipment, destination, and commercial agreement.'
    ), 'published', now() - interval '6 minutes'
  ),
  (
    'faq', 'repeat-orders', 'Can you support repeat or monthly orders?', null,
    jsonb_build_object(
      'question', 'Can you support repeat or monthly orders?',
      'answer', 'Yes. Repeat-order sourcing can be arranged, subject to seasonal availability, approved specifications, and confirmed monthly capacity.',
      'body', 'Yes. Repeat-order sourcing can be arranged, subject to seasonal availability, approved specifications, and confirmed monthly capacity.'
    ), 'published', now() - interval '7 minutes'
  )
on conflict (collection, slug) do nothing;
