update public.products
set primary_image_url = regexp_replace(primary_image_url, '\.png$', '.webp'),
    updated_at = now()
where primary_image_url in (
  '/vanilla-grade-a.png',
  '/vanilla-grade-b.png',
  '/vanilla-cuts.png',
  '/vanilla-powder.png',
  '/hero-vanilla.png'
);

update public.seo_settings
set canonical_url = case
      when route = '/' then 'https://www.askglobalexport.com/'
      else canonical_url
    end,
    og_image_url = case
      when route = '/' then 'https://www.askglobalexport.com/og.jpg'
      when og_image_url like '%.png' then regexp_replace(og_image_url, '\.png$', '.webp')
      else og_image_url
    end,
    updated_at = now()
where route = '/' or og_image_url like '%.png';
