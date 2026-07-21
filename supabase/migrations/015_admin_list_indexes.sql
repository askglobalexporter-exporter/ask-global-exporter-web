-- Indexes aligned with bounded, ordered admin list queries.
create index if not exists products_admin_order_idx
  on public.products (position, updated_at desc);

create index if not exists cms_entries_admin_list_idx
  on public.cms_entries (collection, updated_at desc);

create index if not exists admin_profiles_created_idx
  on public.admin_profiles (created_at desc);

create index if not exists quote_requests_status_created_idx
  on public.quote_requests (status, created_at desc);

create index if not exists sample_requests_status_created_idx
  on public.sample_requests (status, created_at desc);

create index if not exists media_assets_created_idx
  on public.media_assets (created_at desc);

create index if not exists media_folders_name_idx
  on public.media_folders (name);
