import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

const PRODUCT_FIELDS = [
  "id",
  "handle",
  "title",
  "subtitle",
  "thumbnail",
  "status",
  "metadata",
  "images.*",
  "variants.id",
  "variants.title",
  "variants.prices.*",
  "variants.options.*",
  "options.*",
  "options.values.*",
  "collection.*",
] as const

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const slug = req.params.slug
  if (!slug) {
    return res.status(400).json({ message: "Persona slug is required" })
  }

  const limit = Math.min(Number(req.query.limit ?? 24), 100)
  const offset = Math.max(Number(req.query.offset ?? 0), 0)

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // Pull published products. Persona tags live in JSONB metadata; we filter in
  // the application layer because PG JSONB containment via the remote query
  // builder isn't first-class. The result set is bounded by the store catalogue
  // (hundreds, not millions), so this stays cheap.
  const { data: all } = await query.graph({
    entity: "product",
    fields: [...PRODUCT_FIELDS],
    filters: { status: "published" },
  })

  const matched = (all ?? []).filter((p: any) => {
    const tags = p?.metadata?.persona_tags
    return Array.isArray(tags) && tags.includes(slug)
  })

  const paginated = matched.slice(offset, offset + limit)

  return res.json({
    products: paginated,
    count: matched.length,
    limit,
    offset,
  })
}
