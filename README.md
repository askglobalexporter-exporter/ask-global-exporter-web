# Ask Global Exporter

Production website and CMS for Ask Global, built with Next.js App Router, TypeScript, Supabase, ImageKit, and Vercel.

## Local development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and provide the client-owned service credentials. Never commit private keys.

## Quality checks

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

## CMS areas

- Homepage layout, visibility, copy, CTA, and imagery
- Product catalogue, specifications, gallery, status, and SEO
- About, company profile, FAQ, testimonials, blog, and export documents
- RFQ and sample request CRM with CSV export
- ImageKit media library
- Route-level SEO metadata
- Role-based access for Super Admin, Marketing, and Content Editor

## Database

Apply the SQL files in `supabase/migrations` in numeric order. Migration `006_cms_public_contract.sql` completes the public CMS contract and fixes homepage hide/show behavior.

## Deployment

The `main` branch is deployed to the client Vercel project. Production URL:

https://www.askglobalexport.com
