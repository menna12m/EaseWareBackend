import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { WISHLIST_MODULE } from "../../../modules/wishlist"
import type WishlistModuleService from "../../../modules/wishlist/service"
import { requireCustomerId } from "../../_lib/auth"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  let customerId: string
  try {
    customerId = requireCustomerId(req)
  } catch (e: any) {
    return res.status(e.statusCode ?? 401).json({ message: e.message })
  }

  const wishlistService: WishlistModuleService =
    req.scope.resolve(WISHLIST_MODULE)

  const wishlist = await wishlistService.getOrCreateForCustomer(customerId)
  const productIds: string[] = Array.isArray(wishlist.product_ids)
    ? (wishlist.product_ids as string[])
    : []

  if (productIds.length === 0) {
    return res.json({ product_ids: [], products: [] })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "handle",
      "title",
      "thumbnail",
      "metadata",
      "variants.prices.*",
    ],
    filters: { id: productIds },
  })

  return res.json({ product_ids: productIds, products: products ?? [] })
}
