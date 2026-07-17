-- Mobile-specific hero imagery and focal-point controls.
alter table public.homepage_hero_slides
  add column if not exists mobile_image_url text,
  add column if not exists desktop_position text not null default 'center right',
  add column if not exists mobile_position text not null default 'center center';

update public.homepage_hero_slides
set desktop_position = coalesce(nullif(desktop_position, ''), 'center right'),
    mobile_position = coalesce(nullif(mobile_position, ''), 'center center');
