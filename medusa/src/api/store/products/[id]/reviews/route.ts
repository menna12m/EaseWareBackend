import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { REVIEW_MODULE } from "../../../../../modules/review"
import type ReviewModuleService from "../../../../../modules/review/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const productId = req.params.id
  if (!productId) {
    return res.status(400).json({ message: "Product id is required" })
  }

  const reviewService: ReviewModuleService = req.scope.resolve(REVIEW_MODULE)
  const stats = await reviewService.getProductReviewStats(productId)
  return res.json(stats)
}

type CreateReviewBody = {
  customer_name?: unknown
  rating?: unknown
  body?: unknown
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const productId = req.params.id
  if (!productId) {
    return res.status(400).json({ message: "Product id is required" })
  }

  const { customer_name, rating, body } = (req.body ?? {}) as CreateReviewBody

  const errors: string[] = []
  if (typeof customer_name !== "string" || customer_name.trim().length === 0) {
    errors.push("customer_name is required and must be a non-empty string")
  }
  const ratingNum = Number(rating)
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    errors.push("rating must be an integer between 1 and 5")
  }
  if (typeof body !== "string" || body.trim().length < 10) {
    errors.push("body must be at least 10 characters")
  }
  if (errors.length) {
    return res.status(422).json({ message: "Validation failed", errors })
  }

  const reviewService: ReviewModuleService = req.scope.resolve(REVIEW_MODULE)
  const review = await reviewService.createReviews({
    product_id: productId,
    customer_name: (customer_name as string).trim(),
    rating: ratingNum,
    body: (body as string).trim(),
  })

  return res.status(201).json({ review })
}
