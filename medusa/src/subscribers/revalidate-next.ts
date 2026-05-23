import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import axios from "axios"

/**
 * Fires a revalidate webhook to the Next.js frontend on every product change.
 *
 * Mirrors the role Strapi's lifecycle hooks play for editorial content. Tags
 * sent must match the `next: { tags }` keys used by lib/api/medusa.ts and
 * lib/shop/medusa-search-client.ts so the right pages refresh.
 *
 * Failures are logged but never block the underlying mutation — the frontend
 * cache will catch up on the next natural revalidate window.
 */
export default async function revalidateNextHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const base = process.env.NEXT_FRONTEND_URL
  const secret = process.env.NEXT_REVALIDATE_SECRET

  if (!base || !secret) {
    logger.warn(
      "[revalidate] NEXT_FRONTEND_URL or NEXT_REVALIDATE_SECRET not set — skipping"
    )
    return
  }

  // Look up the product handle so we can also send the per-product tag.
  let handle: string | undefined
  if (event.data?.id) {
    try {
      const query = container.resolve(ContainerRegistrationKeys.QUERY)
      const { data } = await query.graph({
        entity: "product",
        fields: ["id", "handle"],
        filters: { id: event.data.id },
      })
      handle = data?.[0]?.handle
    } catch {
      // best-effort — product may have been deleted
    }
  }

  const tags = ["products"]
  if (handle) tags.push(`product:${handle}`)

  try {
    await axios.post(
      `${base.replace(/\/$/, "")}/api/revalidate`,
      { secret, tags },
      { timeout: 5000 }
    )
    logger.info(`[revalidate] ${event.name} → ${tags.join(", ")}`)
  } catch (err: any) {
    logger.warn(
      `[revalidate] failed: ${err?.response?.status ?? ""} ${err?.message}`
    )
  }
}

export const config: SubscriberConfig = {
  event: ["product.created", "product.updated", "product.deleted"],
}
