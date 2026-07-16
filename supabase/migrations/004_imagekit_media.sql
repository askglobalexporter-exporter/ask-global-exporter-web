alter table public.media_assets
  add column if not exists provider text not null default 'supabase',
  add column if not exists provider_file_id text;

alter table public.media_assets
  alter column provider set default 'imagekit';

create unique index if not exists media_assets_provider_file_id_idx
  on public.media_assets(provider, provider_file_id)
  where provider_file_id is not null;

comment on column public.media_assets.provider is
  'Blob storage provider. New uploads use ImageKit; legacy Supabase assets remain readable.';

comment on column public.media_assets.provider_file_id is
  'Provider-specific asset ID used for remote deletion and asset management.';
