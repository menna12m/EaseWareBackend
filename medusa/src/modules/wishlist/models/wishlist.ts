import { model } from "@medusajs/framework/utils"

const Wishlist = model.define("wishlist", {
  id: model.id({ prefix: "wl" }).primaryKey(),
  customer_id: model.text().unique("IDX_wishlist_customer_id"),
  product_ids: model.json(),
})

export default Wishlist
