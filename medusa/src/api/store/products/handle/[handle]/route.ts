import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const handle = req.params.handle
  if (!handle) {
    return res.status(400).json({ message: "Handle is required" })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "handle",
      "title",
      "subtitle",
      "description",
      "thumbnail",
      "status",
      "metadata",
      "images.*",
      "options.*",
      "options.values.*",
      "variants.*",
      "variants.prices.*",
      "variants.options.*",
      "collection.*",
      "tags.*",
      "categories.*",
    ],
    filters: { handle, status: "published" },
  })

  const product = data?.[0]
  if (!product) {
    return res.status(404).json({ message: `Product '${handle}' not found` })
  }

  return res.json({ product })
}
