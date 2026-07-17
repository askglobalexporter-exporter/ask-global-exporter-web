-- Fast, bounded dashboard analytics for the authenticated admin panel.
-- Aggregation stays in Postgres so raw event rows never travel to Vercel.

create index if not exists site_events_visitor_created_idx
  on public.site_events (visitor_hash, created_at desc)
  where visitor_hash is not null;

create index if not exists site_events_product_created_idx
  on public.site_events (product_slug, created_at desc)
  where event_type = 'product_view' and product_slug is not null;

create or replace function public.admin_dashboard_analytics(p_days integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  start_at timestamptz := now() - make_interval(days => least(greatest(coalesce(p_days, 30), 1), 90));
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  select jsonb_build_object(
    'unique_visitors', (
      select count(distinct visitor_hash)
      from public.site_events
      where created_at >= start_at
        and event_type in ('page_view', 'product_view')
        and visitor_hash is not null
    ),
    'by_day', (
      select coalesce(jsonb_agg(jsonb_build_object('date', day::date, 'count', event_count) order by day), '[]'::jsonb)
      from (
        select series.day, count(events.id) as event_count
        from generate_series(current_date - 6, current_date, interval '1 day') as series(day)
        left join public.site_events events
          on events.created_at >= series.day
         and events.created_at < series.day + interval '1 day'
         and events.event_type in ('page_view', 'product_view')
        group by series.day
      ) daily
    ),
    'top_countries', (
      select coalesce(jsonb_agg(jsonb_build_object('label', country_code, 'count', event_count) order by event_count desc, country_code), '[]'::jsonb)
      from (
        select country_code, count(*) as event_count
        from public.site_events
        where created_at >= start_at
          and event_type in ('page_view', 'product_view')
          and country_code is not null
        group by country_code
        order by event_count desc, country_code
        limit 5
      ) countries
    ),
    'popular_products', (
      select coalesce(jsonb_agg(jsonb_build_object('label', product_slug, 'count', event_count) order by event_count desc, product_slug), '[]'::jsonb)
      from (
        select product_slug, count(*) as event_count
        from public.site_events
        where created_at >= start_at
          and event_type = 'product_view'
          and product_slug is not null
        group by product_slug
        order by event_count desc, product_slug
        limit 5
      ) products
    )
  ) into result;

  return result;
end;
$$;

revoke all on function public.admin_dashboard_analytics(integer) from public;
grant execute on function public.admin_dashboard_analytics(integer) to authenticated;
