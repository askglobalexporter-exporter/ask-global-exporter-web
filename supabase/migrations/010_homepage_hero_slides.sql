-- Multiple editable hero slides with public read access and admin-only writes.
create table if not exists public.homepage_hero_slides (
  id uuid primary key default gen_random_uuid(),
  eyebrow text not null default '',
  title text not null,
  summary text not null default '',
  image_url text not null,
  cta_label text not null default 'Request quotation',
  cta_url text not null default '/products/vanilla-beans#quotation',
  position integer not null default 0,
  is_visible boolean not null default true,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists homepage_hero_slides_visible_position_idx
  on public.homepage_hero_slides (is_visible, position);

alter table public.homepage_hero_slides enable row level security;

drop policy if exists "Public reads visible hero slides" on public.homepage_hero_slides;
create policy "Public reads visible hero slides" on public.homepage_hero_slides
for select to anon using (is_visible = true);

drop policy if exists "Admins read hero slides" on public.homepage_hero_slides;
create policy "Admins read hero slides" on public.homepage_hero_slides
for select to authenticated using (public.is_admin());

drop policy if exists "Editors manage hero slides" on public.homepage_hero_slides;
create policy "Editors manage hero slides" on public.homepage_hero_slides
for all to authenticated
using (public.admin_can('homepage.write'))
with check (public.admin_can('homepage.write'));

grant select on public.homepage_hero_slides to anon, authenticated;
grant insert, update, delete on public.homepage_hero_slides to authenticated;

insert into public.homepage_hero_slides (eyebrow, title, summary, image_url, cta_label, cta_url, position, is_visible)
select
  coalesce(content ->> 'eyebrow', 'Premium Indonesian vanilla'),
  coalesce(content ->> 'title', 'Vanilla Beans'),
  coalesce(content ->> 'summary', 'Natural, aromatic, and export-ready—sourced with care in Indonesia.'),
  coalesce(nullif(content ->> 'image_url', ''), '/vanilla-grade-a.webp'),
  coalesce(content ->> 'cta_label', 'Request quotation'),
  coalesce(content ->> 'cta_url', '/products/vanilla-beans#quotation'),
  0,
  true
from public.homepage_sections
where section_key = 'hero'
  and not exists (select 1 from public.homepage_hero_slides);
