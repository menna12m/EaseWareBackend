const p = (text: string) => ({
  type: "paragraph",
  children: [{ type: "text", text }],
})

const PERSONAS = [
  {
    slug: "working-woman",
    name: "The Working Woman",
    excerpt: "Long days deserve underwear that keeps up.",
    color_theme: "#8B7355",
    product_tags: ["the-daily-modal-brief", "all-day-lace-capsule"],
    body: [
      p(
        "You move from one meeting to the next, then to dinner, then home — sometimes without changing. The right base layer can carry you through that day without ever asking for attention."
      ),
      p(
        "Modal sits flat, never bunches under tailored trousers, and stays cool even when the air-con loses the fight at 2pm."
      ),
    ],
  },
  {
    slug: "athlete",
    name: "The Athlete",
    excerpt: "Performance fabric that moves with every rep.",
    color_theme: "#4A7C59",
    product_tags: ["sport-seamless-set", "studio-performance-set"],
    body: [
      p(
        "Whether it's the studio, the trail, or the gym floor — your underwear shouldn't be the limiting factor. Bamboo wicks moisture, fights odour, and survives the wash cycle that your gym kit needs every day."
      ),
    ],
  },
  {
    slug: "hijabi",
    name: "The Hijabi",
    excerpt: "Comfort and coverage, thoughtfully designed.",
    color_theme: "#7B6B8A",
    product_tags: ["the-hijab-friendly-slip"],
    body: [
      p(
        "Modest dressing starts with the layer no one sees. Full-coverage slips and breathable cotton designed to sit invisibly under abayas, modest dresses, and layered looks — no rides, no shows, no compromises."
      ),
    ],
  },
  {
    slug: "frequent-traveler",
    name: "The Frequent Traveler",
    excerpt: "Lightweight, packable, wash-and-wear.",
    color_theme: "#5B7FA6",
    product_tags: ["travel-comfort-kit", "studio-performance-set"],
    body: [
      p(
        "A four-day trip, one carry-on, and a hotel sink. Our travel-tested modal essentials wash in seconds and dry overnight — packable in the palm of your hand."
      ),
    ],
  },
  {
    slug: "sensitive-skin",
    name: "Sensitive Skin",
    excerpt: "Hypoallergenic bamboo, nothing harsh.",
    color_theme: "#C4A882",
    product_tags: [
      "sensitive-skin-essentials",
      "the-daily-modal-brief",
      "kids-bamboo-soft-brief",
    ],
    body: [
      p(
        "If your skin reacts to almost everything, you already know fabric matters more than label claims. Our bamboo line is OEKO-TEX certified, hypoallergenic, and finished without harsh dyes or formaldehyde — for adults and kids."
      ),
    ],
  },
  {
    slug: "mother",
    name: "The Mother",
    excerpt: "Comfort for every stage of motherhood.",
    color_theme: "#A67B8A",
    product_tags: ["postpartum-comfort-brief", "sensitive-skin-essentials"],
    body: [
      p(
        "Pregnancy. Postpartum. Recovery. The years that follow. We design with high-rise waistbands, ultra-soft bamboo, and seamless construction so the body can heal and move without anything digging in."
      ),
    ],
  },
]

export async function seedPersonaStories(strapi: any): Promise<void> {
  for (const persona of PERSONAS) {
    const existing = await strapi.entityService.findMany(
      "api::persona-story.persona-story",
      { filters: { slug: persona.slug }, limit: 1 }
    )

    if (Array.isArray(existing) && existing.length > 0) continue

    await strapi.entityService.create("api::persona-story.persona-story", {
      data: {
        ...persona,
        publishedAt: new Date(),
      },
    })
    strapi.log.info(`[seed] persona: ${persona.slug}`)
  }
}
