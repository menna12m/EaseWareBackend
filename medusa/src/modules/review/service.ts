import { MedusaService } from "@medusajs/framework/utils"
import Review from "./models/review"

class ReviewModuleService extends MedusaService({
  Review,
}) {
  async getProductReviewStats(productId: string) {
    const [reviews, total] = await this.listAndCountReviews(
      { product_id: productId },
      { order: { created_at: "DESC" } }
    )

    const average =
      total === 0
        ? 0
        : Number(
            (
              reviews.reduce((sum, r) => sum + r.rating, 0) / total
            ).toFixed(2)
          )

    return { reviews, average_rating: average, total }
  }
}

export default ReviewModuleService
