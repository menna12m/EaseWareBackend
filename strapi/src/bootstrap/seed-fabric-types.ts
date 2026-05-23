const FABRICS = [
  {
    name: "Modal",
    slug: "modal",
    description:
      "Semi-synthetic cellulose fibre made from beech pulp. Soft, breathable, dries fast, gets softer with each wash.",
    properties: {
      softness: 5,
      breathability: 4,
      stretch: 5,
      eco: true,
      hypoallergenic: true,
    },
    care_instructions: [
      "Hand wash cold",
      "Do not bleach",
      "Do not tumble dry",
      "Iron low heat",
    ],
    icon_url: "/icons/modal.svg",
  },
  {
    name: "Bamboo",
    slug: "bamboo",
    description:
      "Naturally antibacterial, hypoallergenic, ultra-breathable. Our top pick for sensitive skin.",
    properties: {
      softness: 5,
      breathability: 5,
      stretch: 3,
      eco: true,
      hypoallergenic: true,
    },
    care_instructions: [
      "Hand wash cold",
      "Do not bleach",
      "Lay flat to dry",
      "Iron low heat",
    ],
    icon_url: "/icons/bamboo.svg",
  },
  {
    name: "Cotton",
    slug: "cotton",
    description:
      "Classic, breathable, durable. We use OEKO-TEX certified long-staple cotton for our cotton line.",
    properties: {
      softness: 4,
      breathability: 5,
      stretch: 3,
      eco: false,
      hypoallergenic: false,
    },
    care_instructions: [
      "Machine wash cold",
      "Tumble dry low",
      "Iron medium heat",
    ],
    icon_url: "/icons/cotton.svg",
  },
  {
    name: "Lace",
    slug: "lace",
    description:
      "Soft stretch lace used as a front panel on our 'all-day' capsule pieces. Backed with modal for comfort.",
    properties: {
      softness: 3,
      breathability: 4,
      stretch: 4,
      eco: false,
      hypoallergenic: false,
    },
    care_instructions: [
      "Hand wash cold",
      "Do not wring",
      "Lay flat to dry",
      "Do not iron",
    ],
    icon_url: "/icons/lace.svg",
  },
]

export async function seedFabricTypes(strapi: any): Promise<void> {
  for (const fabric of FABRICS) {
    const existing = await strapi.entityService.findMany(
      "api::fabric-type.fabric-type",
      { filters: { slug: fabric.slug }, limit: 1 }
    )

    if (Array.isArray(existing) && existing.length > 0) continue

    await strapi.entityService.create("api::fabric-type.fabric-type", {
      data: {
        ...fabric,
        publishedAt: new Date(),
      },
    })
    strapi.log.info(`[seed] fabric: ${fabric.slug}`)
  }
}
