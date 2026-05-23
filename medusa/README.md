# Easewear — Medusa v2 Backend

Headless commerce backend for [Easewear](https://vanilla-wear.com). Built on
**Medusa v2** (Node 20, TypeScript, PostgreSQL, Redis).

Sibling service: [`../strapi`](../strapi) provides editorial content.

## Features

- Products, variants (Color × Size), collections, cart, orders
- Custom **Review** module (`/store/products/:id/reviews`)
- Custom **Wishlist** module (JWT-authenticated)
- Custom routes: by-persona, fabric-filter, product-by-handle
- **Algolia** sync subscriber on product create/update/delete
- **Paymob** payment provider (Egyptian payment gateway)
- Currency: EGP only

## Local Development

### Prerequisites

- Node 20+
- PostgreSQL 14+
- Redis 6+
- (Optional) Algolia account, Paymob credentials

### Setup

```bash
cp .env.example .env
# Fill in DATABASE_URL, REDIS_URL, and secrets

npm install
npx medusa db:create        # if database doesn't exist
npx medusa db:migrate       # run all migrations (core + custom modules)
npm run seed                # seed products, collections, region (Egypt)
npx medusa user -e admin@easewear.local -p supersecret   # create admin
npm run dev
```

The seed script prints a **publishable API key** at the end — give that to the
Next.js frontend via `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`.

Servers:
- Store API: http://localhost:9000/store
- Admin API: http://localhost:9000/admin
- Admin UI: http://localhost:9000/app

## Environment Reference

| Var | Required | Description |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string |
| `REDIS_URL` | yes | Redis URL (job queue + cache + event bus) |
| `JWT_SECRET` | yes | Used for both Medusa core auth **and** the wishlist endpoints |
| `COOKIE_SECRET` | yes | Admin session cookies |
| `STORE_CORS` | yes | Comma-separated allow-list for `/store/*` |
| `ADMIN_CORS` | yes | Comma-separated allow-list for `/admin/*` |
| `AUTH_CORS` | yes | Comma-separated allow-list for `/auth/*` |
| `PAYMOB_API_KEY` | optional | Paymob secret API key |
| `PAYMOB_INTEGRATION_ID` | optional | Paymob integration id |
| `PAYMOB_IFRAME_ID` | optional | Paymob iframe id (returned as `iframe_url` in session data) |
| `ALGOLIA_APP_ID` | optional | Algolia application id |
| `ALGOLIA_ADMIN_KEY` | optional | Algolia admin API key (write) |
| `NEXT_REVALIDATE_SECRET` | optional | Forwarded to Strapi for ISR webhook auth |
| `NEXT_FRONTEND_URL` | optional | Used for cross-service revalidation |
| `MEDUSA_BACKEND_URL` | optional | Public URL — used by admin SDK |

## Custom API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/store/products/handle/:handle` | publishable key | Product by handle |
| GET | `/store/products/by-persona/:slug` | publishable key | Products whose `metadata.persona_tags` contains slug |
| GET | `/store/products/fabric-filter` | publishable key | Filter by `fabric_front`, `fabric_back`, `fabric_lining`, `category`, `product_type`, `size`, `color` |
| GET | `/store/products/:id/reviews` | publishable key | `{ reviews, average_rating, total }` |
| POST | `/store/products/:id/reviews` | publishable key | Body: `{ customer_name, rating (1-5), body (min 10 chars) }` |
| GET | `/store/wishlist` | **JWT (Bearer)** | Customer's wishlist + populated products |
| POST | `/store/wishlist/toggle` | **JWT (Bearer)** | Body: `{ product_id }`. Returns `{ product_ids, action }` |

## Architecture Notes

### Wishlist auth
Wishlist routes accept `Authorization: Bearer <jwt>` signed with `JWT_SECRET`.
The customer id is resolved from `app_metadata.customer_id`, then `actor_id`,
then `customer_id`, then `sub`. See [src/api/_lib/auth.ts](src/api/_lib/auth.ts).

### Algolia
The subscriber [src/subscribers/algolia-sync.ts](src/subscribers/algolia-sync.ts)
listens to `product.created`, `product.updated`, `product.deleted`. On first
write it sets `attributesForFaceting` for `persona_tags`, `fabric_front`,
`fabric_back`, `fabric_lining`, `colors`, `sizes`, `category`, `product_type`.

To backfill an empty Algolia index after a seed:
```bash
npx medusa exec ./src/scripts/seed.ts   # the subscriber fires per product
```

### Paymob
Three-step Paymob flow lives in [src/modules/paymob/service.ts](src/modules/paymob/service.ts):
auth → register order → payment key. The session data returned to the frontend
includes `iframe_url`, ready to embed.

Webhook: configure Paymob to POST to `/hooks/payment/paymob_paymob` (Medusa's
standard payment-provider webhook path). HMAC verification is delegated to the
Paymob dashboard's transaction-processed callback.

## Railway Deploy

1. Create a new Railway project, attach a PostgreSQL plugin and a Redis plugin.
2. Add a new service from this repo's `medusa/` directory.
3. Railway picks up [railway.toml](railway.toml) automatically (Nixpacks builder).
4. Set the env vars from `.env.example`. Use the Railway-provided
   `DATABASE_URL` and `REDIS_URL`.
5. Trigger a deploy. The build command runs migrations.
6. Once deployed, exec `npm run seed` once via the Railway shell.

## Folder Structure

```
src/
  api/
    _lib/auth.ts                 ← JWT customer extraction
    middlewares.ts               ← CORS scaffolding for custom routes
    store/
      products/
        handle/[handle]/route.ts
        by-persona/[slug]/route.ts
        fabric-filter/route.ts
        [id]/reviews/route.ts
      wishlist/
        route.ts
        toggle/route.ts
  modules/
    review/       ← model + service + module def
    wishlist/     ← model + service + module def
    algolia/      ← Algolia client wrapper
    paymob/       ← AbstractPaymentProvider impl
  subscribers/
    algolia-sync.ts
  scripts/
    seed.ts
medusa-config.ts
railway.toml
```
