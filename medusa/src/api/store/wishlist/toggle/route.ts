import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { WISHLIST_MODULE } from "../../../../modules/wishlist"
import type WishlistModuleService from "../../../../modules/wishlist/service"
import { requireCustomerId } from "../../../_lib/auth"

type ToggleBody = { product_id?: unknown }

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  let customerId: string
  try {
    customerId = requireCustomerId(req)
  } catch (e: any) {
    return res.status(e.statusCode ?? 401).json({ message: e.message })
  }

  const { product_id } = (req.body ?? {}) as ToggleBody
  if (typeof product_id !== "string" || product_id.trim().length === 0) {
    return res.status(422).json({ message: "product_id is required" })
  }

  const wishlistService: WishlistModuleService =
    req.scope.resolve(WISHLIST_MODULE)

  const result = await wishlistService.toggleProduct(customerId, product_id)
  return res.json(result)
}
