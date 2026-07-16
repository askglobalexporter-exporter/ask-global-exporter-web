# Ask Global Admin Panel

## What is included

- Supabase Auth with cookie-based server sessions.
- Database-enforced roles: Super Admin, Marketing, and Content Editor.
- CMS collections for homepage, about, FAQ, testimonials, blog, export documents, and company profile.
- Product catalogue CRUD, draft/publish, featured products, specifications, packaging, grades, MOQ, lead time, and Incoterms.
- RFQ and sample-request CRM with status workflows and CSV export.
- Media Library with folders, browser-side compression, WebP conversion, and ImageKit storage.
- Per-route SEO settings and a reorderable, hide/show Homepage Builder.
- Dashboard activity, visitor events, inquiry totals, and published-product totals.
- Team invitations, role changes, audit events, and RLS policies.

## Deployment setup

1. Apply migrations `001`, `002`, and `003` to the client Supabase project in order.
2. In Supabase Auth, create the first user with `askglobalexporter@gmail.com`.
3. Promote that account once in SQL:

```sql
update public.admin_profiles
set role = 'super_admin', is_active = true
where user_id = (
  select id from auth.users where email = 'askglobalexporter@gmail.com'
);
```

4. Configure these Vercel variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or the legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SECRET_KEY` or the legacy `SUPABASE_SERVICE_ROLE_KEY`
- `IMAGEKIT_PUBLIC_KEY`
- `IMAGEKIT_PRIVATE_KEY` (server-only)
- `IMAGEKIT_URL_ENDPOINT`

5. Add the production URL to Supabase Auth URL Configuration. The admin sign-in route is `/admin/login`.

## Role matrix

| Area | Super Admin | Marketing | Content Editor |
| --- | --- | --- | --- |
| Dashboard | Full | Full | Summary |
| RFQ and samples | Full | Full | No access |
| Products | Full | No access | Full |
| Core content | Full | Blog/testimonials | Full |
| Homepage builder | Full | No access | Full |
| Media | Full | Full | Full |
| SEO | Full | Full | Full |
| Team and roles | Full | No access | No access |

The Supabase and ImageKit private keys are server-only and must never use a `NEXT_PUBLIC_` prefix.
