# Easewear Backend

Two-service monorepo for the [Easewear](https://vanilla-wear.com) headless
storefront. Consumed by a Next.js 14 App Router frontend over REST.

```
┌──────────────────────────────┐         ┌──────────────────────────────┐
│  Next.js 14 (App Router)     │  fetch  │   Medusa v2  (port 9000)     │
│  vanilla-wear.com            │ ──────► │   commerce — products,       │
│  - persona pages             │         │   variants, cart, orders,    │
│  - product pages             │         │   reviews, wishlist          │
│  - editorial pages           │         │   Postgres + Redis           │
│                              │         └──────────────────────────────┘
│                              │ ──────► ┌──────────────────────────────┐
│                              │         │   Strapi v4 (port 1337)      │
│                              │         │   CMS — persona stories,     │
│                              │         │   FAQs, policy pages,        │
│                              │  ◄────── │   fabric info, size charts   │
│   /api/revalidate            │ revalidate (lifecycle hooks)           │
└──────────────────────────────┘         └──────────────────────────────┘
                                              │
                                              ▼ (Medusa product subscriber)
                                         ┌──────────┐
                                         │ Algolia  │  "easewear_products"
                                         └──────────┘
```

## Services

| Path | Stack | What it owns |
|---|---|---|
| [`medusa/`](medusa/README.md) | Medusa v2, Node 20, Postgres, Redis | Catalogue, cart, checkout, orders, reviews, wishlist, Paymob payments, Algolia sync |
| [`strapi/`](strapi/README.md) | Strapi v4, Node 18–22, Postgres, Cloudinary | Persona stories, FAQs, policy pages, fabric info, size charts |

## Quick Start (Both Services)

```bash
# Terminal 1 — commerce
cd medusa
cp .env.example .env   # fill DATABASE_URL, REDIS_URL, secrets
npm install
npx medusa db:migrate
npm run seed
npm run dev            # http://localhost:9000

# Terminal 2 — CMS
cd strapi
cp .env.example .env   # fill DATABASE_URL, APP_KEYS, secrets
npm install
npm run develop        # http://localhost:1337/admin
```

## Frontend Contract

The Next.js frontend expects:

**From Medusa**
- `GET /store/products/handle/:handle`
- `GET /store/products/by-persona/:slug`
- `GET /store/products/fabric-filter?fabric_front=...&color=...&size=...`
- `GET /store/products/:id/reviews`
- `POST /store/products/:id/reviews`
- `GET /store/wishlist` (Bearer JWT)
- `POST /store/wishlist/toggle` (Bearer JWT)
- Plus all standard Medusa store endpoints (cart, checkout, etc.)

**From Strapi**
- `GET /api/persona-stories?populate=hero_image`
- `GET /api/persona-stories/:slug/product-handles` → cross-fetch from Medusa
- `GET /api/faqs?filters[category]=sizing&sort=sort_order`
- `GET /api/policy-pages?filters[type]=privacy`
- `GET /api/fabric-types`
- `GET /api/size-charts?filters[category]=women`

**Next.js must expose** `POST /api/revalidate`:
```ts
// app/api/revalidate/route.ts
import { revalidateTag } from "next/cache"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { secret, tag } = await req.json()
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  revalidateTag(tag)
  return NextResponse.json({ ok: true, tag })
}
```

Pair each fetch with `next: { tags: ['stories' | 'faqs' | 'policies'] }`
so the Strapi lifecycle hooks invalidate the right pages.

## Shared Secrets

Two shared values must match across services:

| Var | Medusa | Strapi | Next.js |
|---|---|---|---|
| `REVALIDATE_SECRET` | passes to Strapi via env | calls Next on lifecycle | validates on `/api/revalidate` |
| `JWT_SECRET` | signs customer JWTs (used by wishlist routes) | — | passes JWT to Medusa wishlist endpoints |

## Railway Deploy

Each service ships with its own `railway.toml`. Recommended layout:

```
Railway Project: easewear-backend
├── Service: medusa   ←   medusa/   + Postgres plugin + Redis plugin
└── Service: strapi   ←   strapi/   + Postgres plugin
```

See each service README for step-by-step deploy notes.
