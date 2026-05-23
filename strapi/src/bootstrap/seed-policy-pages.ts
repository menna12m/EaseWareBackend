const today = () => new Date().toISOString().slice(0, 10)

const p = (text: string) => ({
  type: "paragraph",
  children: [{ type: "text", text }],
})

const h = (text: string, level: 2 | 3 = 2) => ({
  type: "heading",
  level,
  children: [{ type: "text", text }],
})

const POLICIES = [
  {
    type: "privacy" as const,
    title: "Privacy Policy",
    body: [
      h("Privacy Policy"),
      p(
        "Easewear collects only the information needed to fulfil orders and improve the shopping experience. We do not sell personal data."
      ),
      h("What we collect", 3),
      p(
        "Name, email, phone, shipping address, payment metadata (handled by Paymob), and order history. We use cookies for cart persistence and analytics."
      ),
      h("How we use it", 3),
      p(
        "Order fulfilment, customer support, marketing emails (only with your consent), and aggregate analytics."
      ),
      h("Your rights", 3),
      p(
        "You may request a copy of your data, correction of inaccuracies, or deletion. Contact privacy@vanilla-wear.com."
      ),
    ],
  },
  {
    type: "shipping" as const,
    title: "Shipping & Delivery",
    body: [
      h("Shipping & Delivery"),
      p(
        "We ship across Egypt within 2–4 business days. International orders are available on request — contact us before ordering."
      ),
      h("Rates", 3),
      p(
        "Flat-rate 60 EGP across all governorates. Free over 750 EGP."
      ),
      h("Tracking", 3),
      p(
        "You will receive a tracking link via SMS and email once the order is dispatched."
      ),
    ],
  },
  {
    type: "returns" as const,
    title: "Returns & Exchanges",
    body: [
      h("Returns & Exchanges"),
      p(
        "For hygiene reasons, intimate apparel can only be returned unworn, unwashed, and in the original packaging with all tags attached."
      ),
      h("Window", 3),
      p("Returns accepted within 14 days of delivery."),
      h("Exchanges", 3),
      p(
        "Free size exchange within Egypt for the first exchange per order."
      ),
      h("Faulty items", 3),
      p(
        "If you receive a defective item, we'll replace it or refund you in full."
      ),
    ],
  },
  {
    type: "terms" as const,
    title: "Terms of Service",
    body: [
      h("Terms of Service"),
      p(
        "By using vanilla-wear.com you agree to these terms. They are governed by the laws of the Arab Republic of Egypt."
      ),
      h("Pricing", 3),
      p(
        "All prices are in Egyptian Pounds (EGP) and include VAT where applicable."
      ),
      h("Account security", 3),
      p(
        "You are responsible for keeping your account credentials safe. Notify us immediately of any unauthorized use."
      ),
    ],
  },
]

export async function seedPolicyPages(strapi: any): Promise<void> {
  for (const policy of POLICIES) {
    const existing = await strapi.entityService.findMany(
      "api::policy-page.policy-page",
      { filters: { type: policy.type }, limit: 1 }
    )

    if (Array.isArray(existing) && existing.length > 0) continue

    await strapi.entityService.create("api::policy-page.policy-page", {
      data: {
        ...policy,
        last_updated: today(),
        publishedAt: new Date(),
      },
    })
    strapi.log.info(`[seed] policy: ${policy.type}`)
  }
}
