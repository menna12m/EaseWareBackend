const p = (text: string) => ({
  type: "paragraph",
  children: [{ type: "text", text }],
})

const FAQS = [
  // General
  {
    question: "Where can I find the size guide?",
    answer: [
      p(
        "Every product page links to the relevant size chart. You can also find the full women's and kids' guides in the footer under 'Sizing'."
      ),
    ],
    category: "general" as const,
    sort_order: 1,
  },
  {
    question: "What is your return policy?",
    answer: [
      p(
        "Unworn, unwashed items in their original packaging can be returned within 14 days. The first size exchange within Egypt is free."
      ),
    ],
    category: "general" as const,
    sort_order: 2,
  },
  // Sizing
  {
    question: "How does Easewear sizing run?",
    answer: [
      p(
        "Our sizing runs true-to-body. Measure yourself, compare against the chart, and size up if you're between sizes — our fabric won't gap, and a slightly looser fit is more comfortable for all-day wear."
      ),
    ],
    category: "sizing" as const,
    sort_order: 1,
  },
  {
    question: "How do I measure myself correctly?",
    answer: [
      p(
        "Use a soft measuring tape against bare skin or thin clothing. Bust: around the fullest part. Waist: at the narrowest point. Hip: around the fullest part of the hips and seat."
      ),
    ],
    category: "sizing" as const,
    sort_order: 2,
  },
  // Fabric
  {
    question: "What is modal fabric?",
    answer: [
      p(
        "Modal is a semi-synthetic cellulose fibre made from beech tree pulp. It's about 50% more absorbent than cotton, dries faster, resists shrinking and pilling, and gets softer with each wash."
      ),
    ],
    category: "fabric" as const,
    sort_order: 1,
  },
  {
    question: "Bamboo vs cotton — what's the difference?",
    answer: [
      p(
        "Bamboo is naturally antibacterial, hypoallergenic, and more breathable than cotton. Cotton is more familiar and slightly more durable for heavy-wash items. For sensitive skin, we always recommend bamboo."
      ),
    ],
    category: "fabric" as const,
    sort_order: 2,
  },
  // Care
  {
    question: "How should I wash Easewear pieces?",
    answer: [
      p(
        "Hand wash cold with a gentle detergent. If you must machine wash, use a delicates bag on the cold cycle. Always lay flat or hang to dry — heat damages the fibres."
      ),
    ],
    category: "care" as const,
    sort_order: 1,
  },
  {
    question: "Can I tumble dry my Easewear pieces?",
    answer: [
      p(
        "We strongly recommend against tumble drying. High heat breaks down the elastane and shortens the life of the garment. Lay flat or hang to dry."
      ),
    ],
    category: "care" as const,
    sort_order: 2,
  },
  // Shipping
  {
    question: "How long does delivery take within Egypt?",
    answer: [
      p(
        "Orders ship within 1 business day and arrive in 2–4 business days across all governorates. Greater Cairo typically arrives in 1–2 business days."
      ),
    ],
    category: "shipping" as const,
    sort_order: 1,
  },
  {
    question: "Do you ship internationally?",
    answer: [
      p(
        "We currently focus on Egypt. International shipping is available on request to MENA countries — contact us at hello@vanilla-wear.com for a quote."
      ),
    ],
    category: "shipping" as const,
    sort_order: 2,
  },
  // Product-specific (The Daily Modal Brief)
  {
    question: "Does the Daily Modal Brief have an elastic waistband?",
    answer: [
      p(
        "Yes — but it's a flat, bonded waistband (no traditional elastic), so it sits invisibly under clothing without digging in or leaving marks."
      ),
    ],
    product_tag: "the-daily-modal-brief",
    category: "fabric" as const,
    sort_order: 1,
  },
  {
    question: "Is the Daily Modal Brief OK for sensitive skin?",
    answer: [
      p(
        "Absolutely. The modal outer and bamboo lining are both OEKO-TEX certified, hypoallergenic, and free from harsh dyes. We see this on lots of repeat orders from customers with eczema and sensitive skin."
      ),
    ],
    product_tag: "the-daily-modal-brief",
    category: "fabric" as const,
    sort_order: 2,
  },
]

export async function seedFaqs(strapi: any): Promise<void> {
  for (const faq of FAQS) {
    const existing = await strapi.entityService.findMany("api::faq.faq", {
      filters: { question: faq.question, product_tag: faq.product_tag ?? null },
      limit: 1,
    })

    if (Array.isArray(existing) && existing.length > 0) continue

    await strapi.entityService.create("api::faq.faq", {
      data: {
        ...faq,
        publishedAt: new Date(),
      },
    })
    strapi.log.info(`[seed] faq: ${faq.question}`)
  }
}
