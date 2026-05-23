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
  "variants.options.option.title",
  "options.*",
  "options.values.*",
  "collection.*",
] as const

type FilterQuery = {
  fabric_front?: string
  fabric_back?: string
  fabric_lining?: string
  category?: string
  product_type?: string
  size?: string
  color?: string
  limit?: string
  offset?: string
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const q = req.query as FilterQuery

  const limit = Math.min(Number(q.limit ?? 24), 100)
  const offset = Math.max(Number(q.offset ?? 0), 0)

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: products } = await query.graph({
    entity: "product",
    fields: [...PRODUCT_FIELDS],
    filters: { status: "published" },
  })

  const metaMatch = (p: any) => {
    const m = p?.metadata ?? {}
    if (q.fabric_front && m.fabric_front !== q.fabric_front) return false
    if (q.fabric_back && m.fabric_back !== q.fabric_back) return false
    if (q.fabric_lining && m.fabric_lining !== q.fabric_lining) return false
    if (q.category && m.category !== q.category) return false
    if (q.product_type && m.product_type !== q.product_type) return false
    return true
  }

  const variantMatch = (p: any) => {
    if (!q.size && !q.color) return true
    const variants = p?.variants ?? []
    return variants.some((v: any) => {
      let sizeOk = !q.size
      let colorOk = !q.color
      for (const opt of v.options ?? []) {
        const title = (opt.option?.title || "").toLowerCase()
        if (q.size && title === "size" && opt.value === q.size) sizeOk = true
        if (q.color && title === "color" && opt.value === q.color)
          colorOk = true
      }
      return sizeOk && colorOk
    })
  }

  const filtered = (products ?? []).filter(
    (p: any) => metaMatch(p) && variantMatch(p)
  )

  return res.json({
    products: filtered.slice(offset, offset + limit),
    count: filtered.length,
    limit,
    offset,
  })
}
