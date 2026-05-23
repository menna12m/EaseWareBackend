import { algoliasearch, SearchClient } from "algoliasearch"
import { Logger } from "@medusajs/framework/types"

export type AlgoliaModuleOptions = {
  appId?: string
  adminKey?: string
  indexName?: string
}

type ProductLike = {
  id: string
  title?: string | null
  handle?: string | null
  thumbnail?: string | null
  metadata?: Record<string, any> | null
  variants?: Array<{
    prices?: Array<{ amount: number; currency_code: string }>
    options?: Array<{ option?: { title?: string }; value?: string }>
  }>
}

const FACETING_ATTRIBUTES = [
  "persona_tags",
  "fabric_front",
  "fabric_back",
  "fabric_lining",
  "colors",
  "sizes",
  "category",
  "product_type",
]

class AlgoliaModuleService {
  protected readonly logger_: Logger | Console
  protected readonly options_: AlgoliaModuleOptions
  protected readonly client_: SearchClient | null
  protected readonly indexName_: string
  protected facetsConfigured_ = false

  constructor({ logger }: { logger?: Logger }, options: AlgoliaModuleOptions) {
    this.logger_ = logger ?? console
    this.options_ = options
    this.indexName_ = options.indexName ?? "easewear_products"

    if (!options.appId || !options.adminKey) {
      this.logger_.warn(
        "[algolia] Missing ALGOLIA_APP_ID or ALGOLIA_ADMIN_KEY — Algolia sync disabled."
      )
      this.client_ = null
      return
    }

    this.client_ = algoliasearch(options.appId, options.adminKey)
  }

  protected isEnabled(): boolean {
    return this.client_ !== null
  }

  async ensureFacets(): Promise<void> {
    if (!this.isEnabled() || this.facetsConfigured_) return
    try {
      await this.client_!.setSettings({
        indexName: this.indexName_,
        indexSettings: {
          attributesForFaceting: FACETING_ATTRIBUTES.map(
            (attr) => `filterOnly(${attr})`
          ),
          searchableAttributes: ["title", "handle", "persona_tags"],
        },
      })
      this.facetsConfigured_ = true
      this.logger_.info("[algolia] Facets configured for " + this.indexName_)
    } catch (err: any) {
      this.logger_.warn("[algolia] Failed to set facets: " + err?.message)
    }
  }

  protected toRecord(product: ProductLike) {
    const metadata = product.metadata ?? {}
    const variants = product.variants ?? []

    const prices: number[] = []
    const colors = new Set<string>()
    const sizes = new Set<string>()

    for (const v of variants) {
      const egp = (v.prices ?? []).find(
        (p) => p.currency_code?.toLowerCase() === "egp"
      )
      if (egp) prices.push(egp.amount)

      for (const opt of v.options ?? []) {
        const title = opt.option?.title?.toLowerCase()
        if (!opt.value) continue
        if (title === "color") colors.add(opt.value)
        if (title === "size") sizes.add(opt.value)
      }
    }

    return {
      objectID: product.id,
      title: product.title,
      handle: product.handle,
      thumbnail: product.thumbnail,
      price: prices.length ? Math.min(...prices) : null,
      colors: Array.from(colors),
      sizes: Array.from(sizes),
      persona_tags: metadata.persona_tags ?? [],
      fabric_front: metadata.fabric_front ?? null,
      fabric_back: metadata.fabric_back ?? null,
      fabric_lining: metadata.fabric_lining ?? null,
      category: metadata.category ?? null,
      product_type: metadata.product_type ?? null,
    }
  }

  async upsertProduct(product: ProductLike): Promise<void> {
    if (!this.isEnabled()) return
    await this.ensureFacets()
    try {
      await this.client_!.saveObject({
        indexName: this.indexName_,
        body: this.toRecord(product),
      })
      this.logger_.info(`[algolia] Upserted ${product.id}`)
    } catch (err: any) {
      this.logger_.error("[algolia] Upsert failed: " + err?.message)
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    if (!this.isEnabled()) return
    try {
      await this.client_!.deleteObject({
        indexName: this.indexName_,
        objectID: productId,
      })
      this.logger_.info(`[algolia] Deleted ${productId}`)
    } catch (err: any) {
      this.logger_.error("[algolia] Delete failed: " + err?.message)
    }
  }
}

export default AlgoliaModuleService
