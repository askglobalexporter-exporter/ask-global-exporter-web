# ALYA Vanilla B2B Upgrade

## Public routes

- `/products/vanilla-beans` — product-range overview and buyer quotation entry point.
- `/products/grade-a-vanilla-beans` — Grade A product detail, RFQ, and sample request.
- `/products/grade-b-vanilla-beans` — Grade B product detail, RFQ, and sample request.
- `/products/vanilla-cuts` — vanilla cuts product detail, RFQ, and sample request.
- `/products/vanilla-powder` — vanilla powder product detail, marked subject to commercial availability.

## API routes

- `POST /api/quotation` — validates RFQs with Zod and inserts through the server-only Supabase client.
- `POST /api/sample` — validates sample requests and inserts through the server-only Supabase client.

## Reusable components and content

- `BrandLogo` — responsive ALYA wordmark using the existing brand colors and typography.
- `SpecificationTable` — reusable desktop/mobile technical specification view.
- `ProductDetail` — reusable B2B product-detail experience driven by typed product data.
- `QuotationForm` and `SampleRequestForm` — React Hook Form + Zod buyer forms.
- `data/products.ts` — typed, CMS-ready product, specification, FAQ, packaging, capacity, and SEO content.

## Supabase

Run `supabase/migrations/001_b2b_inquiries.sql` in the target Supabase project. Configure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as server-only Vercel environment variables. Never expose the service-role key to client code.

## Photography

Current project-owned generated assets:

- `public/vanilla-grade-a.png`
- `public/vanilla-grade-b.png`
- `public/vanilla-cuts.png`
- `public/vanilla-powder.png`
- `public/hero-vanilla.png`

Recommended future client photography replacements:

- Actual farm/vine and supplier-sourcing activity.
- Real harvest selection, curing, sorting, and quality-inspection process.
- Actual vacuum-sealed inner packs and export-ready cartons.
- Approved lot-specific macro photography for each active grade.

Replace generated images only after final photography has been reviewed for accuracy and usage rights.

## Client confirmation required

- Active product list, including whether vanilla powder is commercially offered.
- Final length, moisture, vanillin, color, texture, aroma, shelf-life, and storage specifications.
- MOQ by product and packaging.
- Monthly supply capacity and seasonal availability.
- Lead time, payment terms, Incoterms, and destination coverage.
- Packaging sizes, private-label capability, and sample policy.
- Available export documents for each destination and shipment type.
