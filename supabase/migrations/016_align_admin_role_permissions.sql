-- Keep database-enforced permissions aligned with the application role matrix.
create or replace function public.admin_can(permission text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select case public.current_admin_role()
    when 'super_admin' then true
    when 'marketing' then permission = any(array[
      'dashboard.read','analytics.read','inquiries.read','inquiries.write',
      'content.read','testimonials.write','blog.write','seo.write','media.read','media.write'
    ])
    when 'content_editor' then permission = any(array[
      'dashboard.read','content.read','content.write','products.read','products.write',
      'homepage.write','seo.write','media.read','media.write'
    ])
    else false
  end
$$;

revoke all on function public.admin_can(text) from public;
grant execute on function public.admin_can(text) to authenticated;
