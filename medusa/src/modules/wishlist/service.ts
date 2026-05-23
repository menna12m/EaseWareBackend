import { MedusaService } from "@medusajs/framework/utils"
import Wishlist from "./models/wishlist"

class WishlistModuleService extends MedusaService({
  Wishlist,
}) {
  async getOrCreateForCustomer(customerId: string) {
    const [existing] = await this.listWishlists({ customer_id: customerId })
    if (existing) return existing

    // model.json() types the field as Record<string, unknown> but we store an
    // array. JSONB accepts either at runtime; cast to silence the TS overload.
    try {
      return await this.createWishlists({
        customer_id: customerId,
        product_ids: [] as unknown as Record<string, unknown>,
      })
    } catch (err) {
      // Race condition: another concurrent request inserted the row a
      // moment before us, tripping the unique(customer_id) constraint.
      // Re-fetch and return that row — the create was effectively a no-op.
      const [row] = await this.listWishlists({ customer_id: customerId })
      if (row) return row
      throw err
    }
  }

  async toggleProduct(
    customerId: string,
    productId: string
  ): Promise<{ product_ids: string[]; action: "added" | "removed" }> {
    const wishlist = await this.getOrCreateForCustomer(customerId)
    const currentIds: string[] = Array.isArray(wishlist.product_ids)
      ? (wishlist.product_ids as string[])
      : []

    let nextIds: string[]
    let action: "added" | "removed"

    if (currentIds.includes(productId)) {
      nextIds = currentIds.filter((id) => id !== productId)
      action = "removed"
    } else {
      nextIds = [...currentIds, productId]
      action = "added"
    }

    await this.updateWishlists({
      id: wishlist.id,
      product_ids: nextIds as unknown as Record<string, unknown>,
    })

    return { product_ids: nextIds, action }
  }
}

export default WishlistModuleService
