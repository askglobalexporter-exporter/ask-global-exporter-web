create table if not exists public.inquiry_rate_limits (
  key text primary key,
  request_count integer not null default 0,
  window_started_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.inquiry_rate_limits enable row level security;
create index if not exists inquiry_rate_limits_updated_at_idx on public.inquiry_rate_limits(updated_at);

create or replace function public.consume_inquiry_rate_limit(
  p_key text,
  p_limit integer default 3,
  p_window_seconds integer default 900
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count integer;
begin
  if length(p_key) < 32 or p_limit < 1 or p_window_seconds < 1 then
    return false;
  end if;

  delete from public.inquiry_rate_limits where updated_at < now() - interval '1 day';
  insert into public.inquiry_rate_limits(key, request_count)
  values (p_key, 0)
  on conflict (key) do nothing;

  update public.inquiry_rate_limits
  set request_count = case
        when window_started_at <= now() - make_interval(secs => p_window_seconds) then 1
        else request_count + 1
      end,
      window_started_at = case
        when window_started_at <= now() - make_interval(secs => p_window_seconds) then now()
        else window_started_at
      end,
      updated_at = now()
  where key = p_key
  returning request_count into current_count;

  return current_count <= p_limit;
end;
$$;

revoke all on table public.inquiry_rate_limits from anon, authenticated;
revoke all on function public.consume_inquiry_rate_limit(text, integer, integer) from public;
grant execute on function public.consume_inquiry_rate_limit(text, integer, integer) to service_role;
