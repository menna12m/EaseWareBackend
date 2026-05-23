# Easewear — Strapi v4 CMS

Editorial CMS for [Easewear](https://vanilla-wear.com). Built on **Strapi v4**
(Node ≤22, TypeScript, PostgreSQL, Cloudinary media).

Sibling service: [`../medusa`](../medusa) handles commerce.

## Content Types

| Type | Singular | Public read | Notes |
|---|---|---|---|
| Persona Story | `persona-story` | yes | 6 personas seeded on bootstrap |
| FAQ | `faq` | yes | General + product-specific, 5 categories |
| Policy Page | `policy-page` | yes | privacy / shipping / returns / terms |
| Fabric Type | `fabric-type` | yes | Modal, Bamboo, Cotton, Lace |
| Size Chart | `size-chart` | yes | women + kids |

Public role permissions (`find`, `findOne`) are granted programmatically on
bootstrap — see [src/bootstrap/permissions.ts](src/bootstrap/permissions.ts).

## Custom Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/persona-stories/:slug/product-handles` | Returns `{ product_tags: string[] }` — Next.js then fetches matching products from Medusa |
| GET | `/_health` | Healthcheck for Railway |

## ISR Revalidation

Every Persona Story / FAQ / Policy Page lifecycle hook (`afterCreate`,
`afterUpdate`, `afterDelete`) calls the Next.js frontend's revalidate webhook:

```
POST ${NEXT_FRONTEND_URL}/api/revalidate
{ secret: ${REVALIDATE_SECRET}, tag: 'stories' | 'faqs' | 'policies' }
```

The Next.js handler should validate the secret and call `revalidateTag(tag)`.
Failures are logged but never block the underlying mutation —
see [src/utils/revalidate.ts](src/utils/revalidate.ts).

## Local Development

### Prerequisites

- Node 18–22
- PostgreSQL 14+
- (Optional) Cloudinary account for media uploads

### Setup

```bash
cp .env.example .env
# Fill APP_KEYS, JWT/admin/transfer/api-token secrets (use openssl rand -base64 32),
# DATABASE_URL, and CLOUDINARY_* if you want production-grade media.

npm install
npm run develop
```

On first boot:
- Tables are migrated automatically by Strapi
- Public role permissions are granted
- All seed data is inserted (idempotent — re-runs are no-ops)

Set `SKIP_SEED=true` to skip the seed pass after the initial load.

Servers:
- Admin: http://localhost:1337/admin (create your admin on first visit)
- REST API: http://localhost:1337/api

## Environment Reference

| Var | Required | Description |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string |
| `APP_KEYS` | yes | Comma-separated keys for session signing |
| `API_TOKEN_SALT` | yes | API token salt |
| `TRANSFER_TOKEN_SALT` | yes | Data transfer token salt |
| `ADMIN_JWT_SECRET` | yes | Admin JWT signing key |
| `JWT_SECRET` | yes | User JWT signing key |
| `CLOUDINARY_NAME` | prod | Cloudinary cloud name |
| `CLOUDINARY_KEY` | prod | Cloudinary API key |
| `CLOUDINARY_SECRET` | prod | Cloudinary API secret |
| `CLIENT_URL` | yes | Allowed CORS origin (your Next.js URL) |
| `REVALIDATE_SECRET` | yes | Shared secret with Next.js revalidate handler |
| `NEXT_FRONTEND_URL` | yes | Next.js base URL (e.g. https://vanilla-wear.com) |
| `SKIP_SEED` | optional | Set to `true` after initial seed to skip future bootstrap inserts |

## Railway Deploy

1. Create a Railway project, attach a PostgreSQL plugin.
2. Add a new service from this repo's `strapi/` directory.
3. Railway picks up [railway.toml](railway.toml) automatically.
4. Fill env vars from `.env.example`. Use the Railway-provided `DATABASE_URL`.
5. Deploy. Strapi auto-migrates tables and runs the bootstrap seed.
6. Visit `<service-url>/admin` to create your admin user.
7. (Optional) Once production content is live, set `SKIP_SEED=true` to keep
   the bootstrap step idle on future redeploys.

## Folder Structure

```
src/
  api/
    persona-story/
      content-types/persona-story/
        schema.json
        lifecycles.ts            ← afterCreate/Update/Delete → revalidate('stories')
      controllers/
        persona-story.ts         ← default core controller
        custom.ts                ← productHandles endpoint
      routes/
        persona-story.ts         ← default core router
        custom.ts                ← /persona-stories/:slug/product-handles
      services/persona-story.ts
    faq/         (schema + lifecycles → 'faqs')
    policy-page/ (schema + lifecycles → 'policies')
    fabric-type/ (schema only)
    size-chart/  (schema only)
    health/      (/_health for Railway)
  bootstrap/
    permissions.ts               ← grants Public find/findOne on all types
    seed-persona-stories.ts
    seed-faqs.ts
    seed-policy-pages.ts
    seed-fabric-types.ts
    seed-size-charts.ts
  utils/
    revalidate.ts                ← shared ISR webhook caller
  index.ts                       ← bootstrap() runs permissions + seeds
config/
  database.ts                    ← DATABASE_URL → Postgres
  middlewares.ts                 ← CORS for vanilla-wear.com + localhost
  plugins.ts                     ← Cloudinary upload provider
  server.ts
  admin.ts
  api.ts
railway.toml
```
