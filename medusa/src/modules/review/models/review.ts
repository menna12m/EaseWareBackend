import { model } from "@medusajs/framework/utils"

const Review = model.define("review", {
  id: model.id({ prefix: "rev" }).primaryKey(),
  product_id: model.text().index("IDX_review_product_id"),
  customer_name: model.text(),
  rating: model.number(),
  body: model.text(),
})

export default Review
