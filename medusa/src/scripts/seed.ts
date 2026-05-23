import {
  ExecArgs,
  ISalesChannelModuleService,
  IStoreModuleService,
} from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createCollectionsWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"

const COLORS = ["Ivory", "Blush", "Sage", "Charcoal", "Black"] as const
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const

type SeedProduct = {
  title: string
  handle: string
  description: string
  collection_handle: "women" | "kids"
  thumbnail: string
  base_price: number
  colors: (typeof COLORS)[number][]
  metadata: {
    persona_tags: string[]
    fabric_front: string
    fabric_back: string
    fabric_lining: string
    category: "women" | "kids"
    product_type: "capsule" | "set"
    washing_instructions: string[]
    size_chart_url: string
  }
}

const WOMEN_SIZE_CHART = "https://easewear.com/size-charts/women.pdf"
const KIDS_SIZE_CHART = "https://easewear.com/size-charts/kids.pdf"
const CARE_BASE = [
  "Hand wash cold",
  "Do not bleach",
  "Do not tumble dry",
  "Iron low heat",
]

const PRODUCTS: SeedProduct[] = [
  {
    title: "The Daily Modal Brief",
    handle: "the-daily-modal-brief",
    description:
      "Featherlight modal everyday brief with a buttery-soft bamboo lining. Built for long workdays.",
    collection_handle: "women",
    thumbnail:
      "https://images.unsplash.com/photo-1591348278863-7f3a52c33f6c?w=900",
    base_price: 220,
    colors: ["Ivory", "Blush", "Charcoal"],
    metadata: {
      persona_tags: ["working-woman", "sensitive-skin"],
      fabric_front: "modal",
      fabric_back: "modal",
      fabric_lining: "bamboo",
      category: "women",
      product_type: "capsule",
      washing_instructions: CARE_BASE,
      size_chart_url: WOMEN_SIZE_CHART,
    },
  },
  {
    title: "Sport Seamless Set",
    handle: "sport-seamless-set",
    description:
      "Two-piece seamless set engineered for movement. Bamboo top, breathable cotton blend bottom.",
    collection_handle: "women",
    thumbnail:
      "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=900",
    base_price: 380,
    colors: ["Sage", "Black", "Charcoal"],
    metadata: {
      persona_tags: ["athlete"],
      fabric_front: "bamboo",
      fabric_back: "cotton",
      fabric_lining: "bamboo",
      category: "women",
      product_type: "set",
      washing_instructions: [
        "Machine wash cold",
        "Do not bleach",
        "Lay flat to dry",
      ],
      size_chart_url: WOMEN_SIZE_CHART,
    },
  },
  {
    title: "The Hijab-Friendly Slip",
    handle: "the-hijab-friendly-slip",
    description:
      "Modest, full-coverage cotton slip designed to layer comfortably under abayas and modest wear.",
    collection_handle: "women",
    thumbnail:
      "https://images.unsplash.com/photo-1588117260148-b47818741c74?w=900",
    base_price: 290,
    colors: ["Ivory", "Blush", "Black"],
    metadata: {
      persona_tags: ["hijabi"],
      fabric_front: "cotton",
      fabric_back: "cotton",
      fabric_lining: "bamboo",
      category: "women",
      product_type: "capsule",
      washing_instructions: CARE_BASE,
      size_chart_url: WOMEN_SIZE_CHART,
    },
  },
  {
    title: "Travel Comfort Kit",
    handle: "travel-comfort-kit",
    description:
      "Wash-and-wear modal essentials in a travel pouch. Quick-drying, lightweight, wrinkle-resistant.",
    collection_handle: "women",
    thumbnail:
      "https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=900",
    base_price: 420,
    colors: ["Ivory", "Sage", "Charcoal"],
    metadata: {
      persona_tags: ["frequent-traveler"],
      fabric_front: "modal",
      fabric_back: "modal",
      fabric_lining: "bamboo",
      category: "women",
      product_type: "set",
      washing_instructions: [
        "Hand wash warm",
        "Do not bleach",
        "Hang to dry",
      ],
      size_chart_url: WOMEN_SIZE_CHART,
    },
  },
  {
    title: "Sensitive Skin Essentials",
    handle: "sensitive-skin-essentials",
    description:
      "Hypoallergenic bamboo basics with flat seams and no rough edges. Approved by dermatologists.",
    collection_handle: "women",
    thumbnail:
      "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=900",
    base_price: 340,
    colors: ["Ivory", "Blush", "Sage"],
    metadata: {
      persona_tags: ["sensitive-skin", "mother"],
      fabric_front: "bamboo",
      fabric_back: "bamboo",
      fabric_lining: "bamboo",
      category: "women",
      product_type: "capsule",
      washing_instructions: CARE_BASE,
      size_chart_url: WOMEN_SIZE_CHART,
    },
  },
  {
    title: "The Postpartum Comfort Brief",
    handle: "postpartum-comfort-brief",
    description:
      "High-rise, ultra-soft bamboo brief designed for postpartum recovery. Tagless and seamless.",
    collection_handle: "women",
    thumbnail:
      "https://images.unsplash.com/photo-1604670686804-0bc9b94c2e8e?w=900",
    base_price: 260,
    colors: ["Ivory", "Blush", "Charcoal"],
    metadata: {
      persona_tags: ["mother", "sensitive-skin"],
      fabric_front: "bamboo",
      fabric_back: "bamboo",
      fabric_lining: "bamboo",
      category: "women",
      product_type: "capsule",
      washing_instructions: CARE_BASE,
      size_chart_url: WOMEN_SIZE_CHART,
    },
  },
  {
    title: "All-Day Lace Capsule",
    handle: "all-day-lace-capsule",
    description:
      "Soft stretch lace front, modal back. Looks special, feels invisible.",
    collection_handle: "women",
    thumbnail:
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=900",
    base_price: 310,
    colors: ["Blush", "Black", "Ivory"],
    metadata: {
      persona_tags: ["working-woman"],
      fabric_front: "lace",
      fabric_back: "modal",
      fabric_lining: "bamboo",
      category: "women",
      product_type: "capsule",
      washing_instructions: ["Hand wash cold", "Do not wring", "Lay flat to dry"],
      size_chart_url: WOMEN_SIZE_CHART,
    },
  },
  {
    title: "Studio Performance Set",
    handle: "studio-performance-set",
    description:
      "Moisture-wicking bamboo set built for studio classes, yoga, and pilates.",
    collection_handle: "women",
    thumbnail:
      "https://images.unsplash.com/photo-1591348122449-02525d70379b?w=900",
    base_price: 410,
    colors: ["Sage", "Charcoal", "Black"],
    metadata: {
      persona_tags: ["athlete", "frequent-traveler"],
      fabric_front: "bamboo",
      fabric_back: "bamboo",
      fabric_lining: "bamboo",
      category: "women",
      product_type: "set",
      washing_instructions: ["Machine wash cold", "Tumble dry low"],
      size_chart_url: WOMEN_SIZE_CHART,
    },
  },
  // Kids
  {
    title: "Kids Bamboo Soft Brief",
    handle: "kids-bamboo-soft-brief",
    description:
      "Itch-free bamboo briefs for kids with sensitive skin. Tagless, flat-seam construction.",
    collection_handle: "kids",
    thumbnail:
      "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=900",
    base_price: 150,
    colors: ["Ivory", "Blush", "Sage"],
    metadata: {
      persona_tags: ["sensitive-skin"],
      fabric_front: "bamboo",
      fabric_back: "bamboo",
      fabric_lining: "bamboo",
      category: "kids",
      product_type: "capsule",
      washing_instructions: ["Machine wash cold", "Tumble dry low"],
      size_chart_url: KIDS_SIZE_CHART,
    },
  },
  {
    title: "Kids Active Cotton Set",
    handle: "kids-active-cotton-set",
    description:
      "Breathable cotton set for active kids. Reinforced seams, fade-resistant dyes.",
    collection_handle: "kids",
    thumbnail:
      "https://images.unsplash.com/photo-1503944168566-21d8ef3187e7?w=900",
    base_price: 190,
    colors: ["Charcoal", "Sage", "Black"],
    metadata: {
      persona_tags: ["athlete"],
      fabric_front: "cotton",
      fabric_back: "cotton",
      fabric_lining: "cotton",
      category: "kids",
      product_type: "set",
      washing_instructions: ["Machine wash warm", "Tumble dry low"],
      size_chart_url: KIDS_SIZE_CHART,
    },
  },
]

export default async function seed({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const salesChannelService: ISalesChannelModuleService = container.resolve(
    Modules.SALES_CHANNEL
  )
  const storeService: IStoreModuleService = container.resolve(Modules.STORE)

  logger.info("Seeding Easewear store…")

  // ── Region (Egypt only)
  const countries = ["eg"]

  const [store] = await storeService.listStores()

  let [defaultChannel] = await salesChannelService.listSalesChannels({
    name: "Default Sales Channel",
  })
  if (!defaultChannel) {
    const { result } = await createSalesChannelsWorkflow(container).run({
      input: { salesChannelsData: [{ name: "Default Sales Channel" }] },
    })
    defaultChannel = result[0]
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        supported_currencies: [
          { currency_code: "egp", is_default: true },
        ],
        default_sales_channel_id: defaultChannel.id,
      },
    },
  })

  logger.info("Creating Egypt region…")
  const paymentProviders = ["pp_system_default"]
  if (process.env.PAYMOB_API_KEY && process.env.PAYMOB_INTEGRATION_ID) {
    paymentProviders.push("pp_paymob_paymob")
  }
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Egypt",
          currency_code: "egp",
          countries,
          payment_providers: paymentProviders,
        },
      ],
    },
  })
  const region = regionResult[0]

  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  })

  logger.info("Creating stock location…")
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "Cairo Warehouse",
          address: {
            city: "Cairo",
            country_code: "EG",
            address_1: "Easewear HQ",
          },
        },
      ],
    },
  })
  const stockLocation = stockLocationResult[0]

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
  })

  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
    filters: { type: "default" },
  })

  let defaultShippingProfile = shippingProfiles?.[0]
  if (!defaultShippingProfile) {
    const { result } = await createShippingProfilesWorkflow(container).run({
      input: {
        data: [{ name: "Default Shipping Profile", type: "default" }],
      },
    })
    defaultShippingProfile = result[0]
  }

  const fulfillmentSets = await container
    .resolve(Modules.FULFILLMENT)
    .createFulfillmentSets([
      {
        name: "Egypt Delivery",
        type: "shipping",
        service_zones: [
          {
            name: "Egypt",
            geo_zones: [{ country_code: "eg", type: "country" }],
          },
        ],
      },
    ])

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSets[0].id },
  })

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping (Egypt)",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSets[0].service_zones[0].id,
        shipping_profile_id: defaultShippingProfile.id,
        type: {
          label: "Standard",
          description: "Ships in 2-4 business days",
          code: "standard",
        },
        prices: [
          { currency_code: "egp", amount: 60 },
          { region_id: region.id, amount: 60 },
        ],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
    ],
  })

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultChannel.id],
    },
  })

  logger.info("Creating publishable API key…")
  const { result: apiKeyResult } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        {
          title: "Storefront",
          type: "publishable",
          created_by: "system",
        },
      ],
    },
  })
  const publishableApiKey = apiKeyResult[0]

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultChannel.id],
    },
  })

  logger.info("Creating collections…")
  const { result: collections } = await createCollectionsWorkflow(container).run({
    input: {
      collections: [
        { title: "Women", handle: "women" },
        { title: "Kids", handle: "kids" },
      ],
    },
  })
  const collectionByHandle = Object.fromEntries(
    collections.map((c) => [c.handle, c])
  )

  logger.info("Creating products…")
  for (const seed of PRODUCTS) {
    const variants = seed.colors.flatMap((color) =>
      SIZES.map((size) => {
        const sizeBump =
          size === "XL" ? 30 : size === "XXL" ? 60 : 0
        const price = seed.base_price + sizeBump
        return {
          title: `${color} / ${size}`,
          sku: `${seed.handle}-${color.toLowerCase()}-${size.toLowerCase()}`,
          manage_inventory: false,
          options: { Color: color, Size: size },
          prices: [
            { amount: price, currency_code: "egp" },
            { amount: price, currency_code: "egp", region_id: region.id },
          ],
        }
      })
    )

    await createProductsWorkflow(container).run({
      input: {
        products: [
          {
            title: seed.title,
            handle: seed.handle,
            description: seed.description,
            status: ProductStatus.PUBLISHED,
            collection_id: collectionByHandle[seed.collection_handle].id,
            shipping_profile_id: defaultShippingProfile.id,
            thumbnail: seed.thumbnail,
            images: [{ url: seed.thumbnail }],
            metadata: seed.metadata,
            options: [
              { title: "Color", values: [...seed.colors] },
              { title: "Size", values: [...SIZES] },
            ],
            variants,
            sales_channels: [{ id: defaultChannel.id }],
          },
        ],
      },
    })

    logger.info(`  ✓ ${seed.title}`)
  }

  logger.info("──────────────────────────────────────────")
  logger.info(`Publishable API key: ${publishableApiKey.token}`)
  logger.info("──────────────────────────────────────────")
  logger.info("Seed complete.")
}
