-- Ask Global enterprise admin platform
create extension if not exists pgcrypto;

do $$ begin
  create type public.admin_role as enum ('super_admin', 'marketing', 'content_editor');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.content_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null; end $$;

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role public.admin_role not null default 'content_editor',
  is_active boolean not null default false,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.current_admin_role()
returns public.admin_role
language sql stable security definer set search_path = ''
as $$
  select role from public.admin_profiles
  where user_id = (select auth.uid()) and is_active = true
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.admin_profiles
    where user_id = (select auth.uid()) and is_active = true
  )
$$;

create or replace function public.admin_can(permission text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select case public.current_admin_role()
    when 'super_admin' then true
    when 'marketing' then permission = any(array[
      'dashboard.read','analytics.read','inquiries.read','inquiries.write',
      'testimonials.write','blog.write','seo.write','media.read','media.write'
    ])
    when 'content_editor' then permission = any(array[
      'dashboard.read','content.read','content.write','products.read','products.write',
      'homepage.write','seo.write','media.read','media.write'
    ])
    else false
  end
$$;

revoke all on function public.current_admin_role() from public;
revoke all on function public.is_admin() from public;
revoke all on function public.admin_can(text) from public;
grant execute on function public.current_admin_role() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.admin_can(text) to authenticated;

create or replace function public.handle_new_admin_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.admin_profiles (user_id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_admin_profile on auth.users;
create trigger on_auth_user_created_admin_profile
after insert on auth.users for each row execute function public.handle_new_admin_user();

create table if not exists public.cms_entries (
  id uuid primary key default gen_random_uuid(),
  collection text not null check (collection in (
    'homepage','about','faq','testimonial','blog','export_document','company_profile'
  )),
  slug text not null,
  title text not null,
  excerpt text,
  content jsonb not null default '{}'::jsonb,
  status public.content_status not null default 'draft',
  featured_image_url text,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (collection, slug)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null default 'Agricultural Commodities',
  short_description text not null default '',
  description text not null default '',
  origin text not null default 'Indonesia',
  status public.content_status not null default 'draft',
  is_featured boolean not null default false,
  position integer not null default 0,
  specifications jsonb not null default '[]'::jsonb,
  grades jsonb not null default '[]'::jsonb,
  packaging_options jsonb not null default '[]'::jsonb,
  moq text,
  lead_time text,
  incoterms text[] not null default '{}',
  primary_image_url text,
  seo_title text,
  seo_description text,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text not null default '',
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.media_folders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_id uuid references public.media_folders(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (parent_id, name)
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid references public.media_folders(id) on delete set null,
  filename text not null,
  storage_path text not null unique,
  public_url text not null,
  mime_type text not null,
  size_bytes bigint not null default 0,
  width integer,
  height integer,
  alt_text text not null default '',
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.seo_settings (
  id uuid primary key default gen_random_uuid(),
  route text not null unique,
  meta_title text not null,
  meta_description text not null,
  canonical_url text,
  keywords text[] not null default '{}',
  og_image_url text,
  robots text not null default 'index,follow',
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  label text not null,
  section_type text not null,
  position integer not null default 0,
  is_visible boolean not null default true,
  content jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.inquiry_activity (
  id uuid primary key default gen_random_uuid(),
  inquiry_type text not null check (inquiry_type in ('rfq','sample')),
  inquiry_id bigint not null,
  action text not null,
  note text,
  actor_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.site_events (
  id bigint generated by default as identity primary key,
  event_type text not null check (event_type in ('page_view','product_view','rfq_submitted','sample_submitted')),
  path text not null,
  product_slug text,
  country_code text,
  visitor_hash text,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id bigint generated by default as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists cms_entries_collection_status_idx on public.cms_entries(collection, status);
create index if not exists products_status_position_idx on public.products(status, position);
create index if not exists product_images_product_position_idx on public.product_images(product_id, position);
create index if not exists media_assets_folder_created_idx on public.media_assets(folder_id, created_at desc);
create index if not exists inquiry_activity_lookup_idx on public.inquiry_activity(inquiry_type, inquiry_id, created_at desc);
create index if not exists site_events_type_created_idx on public.site_events(event_type, created_at desc);
create index if not exists site_events_country_idx on public.site_events(country_code, created_at desc);

alter table public.admin_profiles enable row level security;
alter table public.cms_entries enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.media_folders enable row level security;
alter table public.media_assets enable row level security;
alter table public.seo_settings enable row level security;
alter table public.homepage_sections enable row level security;
alter table public.inquiry_activity enable row level security;
alter table public.site_events enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "Admins read own profile" on public.admin_profiles;
create policy "Admins read own profile" on public.admin_profiles for select to authenticated
using ((select auth.uid()) = user_id or public.current_admin_role() = 'super_admin');
drop policy if exists "Super admins manage profiles" on public.admin_profiles;
create policy "Super admins manage profiles" on public.admin_profiles for all to authenticated
using (public.current_admin_role() = 'super_admin') with check (public.current_admin_role() = 'super_admin');

drop policy if exists "Admins read CMS" on public.cms_entries;
create policy "Admins read CMS" on public.cms_entries for select to authenticated using (public.is_admin());
drop policy if exists "Content roles manage CMS" on public.cms_entries;
create policy "Content roles manage CMS" on public.cms_entries for all to authenticated
using (public.admin_can(case when collection = 'testimonial' then 'testimonials.write' when collection = 'blog' then 'blog.write' else 'content.write' end))
with check (public.admin_can(case when collection = 'testimonial' then 'testimonials.write' when collection = 'blog' then 'blog.write' else 'content.write' end));

drop policy if exists "Public reads published CMS" on public.cms_entries;
create policy "Public reads published CMS" on public.cms_entries for select to anon using (status = 'published');

drop policy if exists "Admins read products" on public.products;
create policy "Admins read products" on public.products for select to authenticated using (public.is_admin());
drop policy if exists "Editors manage products" on public.products;
create policy "Editors manage products" on public.products for all to authenticated
using (public.admin_can('products.write')) with check (public.admin_can('products.write'));
drop policy if exists "Public reads published products" on public.products;
create policy "Public reads published products" on public.products for select to anon using (status = 'published');

drop policy if exists "Admins manage product images" on public.product_images;
create policy "Admins manage product images" on public.product_images for all to authenticated
using (public.admin_can('products.write')) with check (public.admin_can('products.write'));
drop policy if exists "Public reads published product images" on public.product_images;
create policy "Public reads published product images" on public.product_images for select to anon
using (exists (select 1 from public.products p where p.id = product_id and p.status = 'published'));

drop policy if exists "Admins read media folders" on public.media_folders;
create policy "Admins read media folders" on public.media_folders for select to authenticated using (public.admin_can('media.read'));
drop policy if exists "Admins manage media folders" on public.media_folders;
create policy "Admins manage media folders" on public.media_folders for all to authenticated
using (public.admin_can('media.write')) with check (public.admin_can('media.write'));
drop policy if exists "Admins read media assets" on public.media_assets;
create policy "Admins read media assets" on public.media_assets for select to authenticated using (public.admin_can('media.read'));
drop policy if exists "Admins manage media assets" on public.media_assets;
create policy "Admins manage media assets" on public.media_assets for all to authenticated
using (public.admin_can('media.write')) with check (public.admin_can('media.write'));

drop policy if exists "Admins read SEO" on public.seo_settings;
create policy "Admins read SEO" on public.seo_settings for select to authenticated using (public.is_admin());
drop policy if exists "SEO roles manage settings" on public.seo_settings;
create policy "SEO roles manage settings" on public.seo_settings for all to authenticated
using (public.admin_can('seo.write')) with check (public.admin_can('seo.write'));

drop policy if exists "Admins read homepage sections" on public.homepage_sections;
create policy "Admins read homepage sections" on public.homepage_sections for select to authenticated using (public.is_admin());
drop policy if exists "Editors manage homepage sections" on public.homepage_sections;
create policy "Editors manage homepage sections" on public.homepage_sections for all to authenticated
using (public.admin_can('homepage.write')) with check (public.admin_can('homepage.write'));
drop policy if exists "Public reads visible homepage sections" on public.homepage_sections;
create policy "Public reads visible homepage sections" on public.homepage_sections for select to anon using (is_visible = true);

drop policy if exists "Commercial roles read quote requests" on public.quote_requests;
create policy "Commercial roles read quote requests" on public.quote_requests for select to authenticated using (public.admin_can('inquiries.read'));
drop policy if exists "Commercial roles update quote requests" on public.quote_requests;
create policy "Commercial roles update quote requests" on public.quote_requests for update to authenticated
using (public.admin_can('inquiries.write')) with check (public.admin_can('inquiries.write'));
drop policy if exists "Commercial roles read sample requests" on public.sample_requests;
create policy "Commercial roles read sample requests" on public.sample_requests for select to authenticated using (public.admin_can('inquiries.read'));
drop policy if exists "Commercial roles update sample requests" on public.sample_requests;
create policy "Commercial roles update sample requests" on public.sample_requests for update to authenticated
using (public.admin_can('inquiries.write')) with check (public.admin_can('inquiries.write'));
drop policy if exists "Commercial roles manage inquiry activity" on public.inquiry_activity;
create policy "Commercial roles manage inquiry activity" on public.inquiry_activity for all to authenticated
using (public.admin_can('inquiries.read')) with check (public.admin_can('inquiries.write'));

drop policy if exists "Analytics roles read events" on public.site_events;
create policy "Analytics roles read events" on public.site_events for select to authenticated using (public.admin_can('analytics.read'));
drop policy if exists "Admins read audit logs" on public.audit_logs;
create policy "Admins read audit logs" on public.audit_logs for select to authenticated using (public.current_admin_role() = 'super_admin');
drop policy if exists "Admins create audit logs" on public.audit_logs;
create policy "Admins create audit logs" on public.audit_logs for insert to authenticated with check (public.is_admin() and actor_id = (select auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760, array['image/jpeg','image/png','image/webp','image/gif','application/pdf'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins upload media" on storage.objects;
create policy "Admins upload media" on storage.objects for insert to authenticated
with check (bucket_id = 'media' and public.admin_can('media.write'));
drop policy if exists "Admins update media" on storage.objects;
create policy "Admins update media" on storage.objects for update to authenticated
using (bucket_id = 'media' and public.admin_can('media.write'))
with check (bucket_id = 'media' and public.admin_can('media.write'));
drop policy if exists "Admins delete media" on storage.objects;
create policy "Admins delete media" on storage.objects for delete to authenticated
using (bucket_id = 'media' and public.admin_can('media.write'));

insert into public.homepage_sections (section_key, label, section_type, position, is_visible, content)
values
  ('hero','Hero','hero',0,true,'{}'), ('about','Who we are','content',1,true,'{}'),
  ('products','Products','products',2,true,'{}'), ('focus','Our focus','features',3,true,'{}'),
  ('process','Export process','timeline',4,true,'{}'), ('compliance','Compliance','documents',5,true,'{}'),
  ('contact','Contact','contact',6,true,'{}')
on conflict (section_key) do nothing;

insert into public.seo_settings (route, meta_title, meta_description, canonical_url, keywords)
values ('/', 'Ask Global — Premium Indonesian Commodities', 'Ask Global connects global buyers with premium Indonesian commodities.', 'https://ask-global-exporter-web.vercel.app', array['Indonesian commodities','global trading','Indonesian exporter'])
on conflict (route) do nothing;

-- Bootstrap the first administrator after creating the Auth user:
-- update public.admin_profiles set role = 'super_admin', is_active = true
-- where user_id = (select id from auth.users where email = 'askglobalexporter@gmail.com');
