-- Editable company identity for the public website and admin panel.
create table if not exists public.company_settings (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null default true unique check (singleton),
  brand_name text not null default 'Ask Global',
  legal_name text not null default 'ASK Global',
  tagline text not null default 'Indonesian commodities · Global trading',
  description text not null default 'Connecting global buyers with premium Indonesian commodities through consistent, transparent, and reliable trade.',
  email text not null default 'askglobalexporter@gmail.com',
  whatsapp_number text not null default '6285196598995',
  whatsapp_display text not null default '+62 851-9659-8995',
  address text not null default 'Jakarta, Indonesia',
  service_area text not null default 'Serving buyers worldwide',
  business_hours text not null default 'Mon–Fri, 09:00–17:00 WIB',
  logo_url text,
  whatsapp_logo_url text,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

insert into public.company_settings (singleton)
values (true)
on conflict (singleton) do nothing;

alter table public.company_settings enable row level security;

drop policy if exists "Public reads company settings" on public.company_settings;
create policy "Public reads company settings" on public.company_settings
for select to anon using (true);

drop policy if exists "Admins read company settings" on public.company_settings;
create policy "Admins read company settings" on public.company_settings
for select to authenticated using (public.is_admin());

drop policy if exists "Editors manage company settings" on public.company_settings;
create policy "Editors manage company settings" on public.company_settings
for all to authenticated
using (public.admin_can('homepage.write'))
with check (public.admin_can('homepage.write'));

grant select on public.company_settings to anon;
grant select, insert, update on public.company_settings to authenticated;
