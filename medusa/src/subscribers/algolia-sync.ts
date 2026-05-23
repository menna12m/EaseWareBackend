import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ALGOLIA_MODULE } from "../modules/algolia"
import type AlgoliaModuleService from "../modules/algolia/service"

const PRODUCT_FIELDS = [
  "id",
  "title",
  "handle",
  "thumbnail",
  "metadata",
  "variants.id",
  "variants.prices.amount",
  "variants.prices.currency_code",
  "variants.options.value",
  "variants.options.option.title",
] as const

export default async function algoliaSyncHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const productId = event.data?.id
  if (!productId) return

  const algolia: AlgoliaModuleService = container.resolve(ALGOLIA_MODULE)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  if (event.name === "product.deleted") {
    await algolia.deleteProduct(productId)
    return
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product",
    fields: [...PRODUCT_FIELDS],
    filters: { id: productId },
  })

  const product = data?.[0]
  if (!product) {
    logger.warn(`[algolia-sync] product ${productId} not found for ${event.name}`)
    return
  }

  await algolia.upsertProduct(product as any)
}

export const config: SubscriberConfig = {
  event: ["product.created", "product.updated", "product.deleted"],
}
