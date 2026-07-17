-- Editable Google Maps destination for the public contact card.
alter table public.company_settings
add column if not exists maps_url text not null default '';
