import { defineMiddlewares } from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/wishlist*",
      method: ["GET", "POST", "OPTIONS"],
    },
    {
      matcher: "/store/products/*/reviews",
      method: ["GET", "POST", "OPTIONS"],
    },
  ],
})
