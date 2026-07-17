-- Normalize legacy text that was imported with a broken Windows/UTF-8 conversion.

update public.cms_entries
set
  title = 'ASK Global — Indonesian sourcing for global business',
  updated_at = now()
where collection = 'about' and slug = 'company-overview';

update public.cms_entries
set
  excerpt = 'Consistency, transparency, and reliable execution—not one-off transactions.',
  updated_at = now()
where collection = 'company_profile' and slug = 'company-principle';

update public.products
set
  grades = '["Ground Vanilla — availability to be confirmed"]'::jsonb,
  updated_at = now()
where slug = 'vanilla-powder';

update public.seo_settings
set
  meta_title = 'Ask Global — Premium Indonesian Commodities',
  canonical_url = 'https://www.askglobalexport.com/',
  updated_at = now()
where route = '/';
