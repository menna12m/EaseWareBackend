const p = (text: string) => ({
  type: "paragraph",
  children: [{ type: "text", text }],
})

const WOMEN_SIZES = [
  { label: "XS", bust_cm: 76, waist_cm: 60, hip_cm: 84 },
  { label: "S", bust_cm: 82, waist_cm: 64, hip_cm: 90 },
  { label: "M", bust_cm: 88, waist_cm: 70, hip_cm: 96 },
  { label: "L", bust_cm: 94, waist_cm: 76, hip_cm: 102 },
  { label: "XL", bust_cm: 102, waist_cm: 84, hip_cm: 110 },
  { label: "XXL", bust_cm: 110, waist_cm: 92, hip_cm: 118 },
]

const KIDS_SIZES = [
  { label: "XS", bust_cm: 56, waist_cm: 50, hip_cm: 58, age: "4-5" },
  { label: "S", bust_cm: 60, waist_cm: 54, hip_cm: 62, age: "6-7" },
  { label: "M", bust_cm: 64, waist_cm: 58, hip_cm: 66, age: "8-9" },
  { label: "L", bust_cm: 68, waist_cm: 62, hip_cm: 70, age: "10-11" },
  { label: "XL", bust_cm: 72, waist_cm: 64, hip_cm: 74, age: "12-13" },
  { label: "XXL", bust_cm: 76, waist_cm: 66, hip_cm: 78, age: "14" },
]

const HOW_TO_MEASURE_WOMEN = [
  p(
    "Use a soft measuring tape, measure against bare skin or thin clothing, and keep the tape parallel to the floor."
  ),
  p(
    "Bust: around the fullest part. Waist: at the narrowest point, usually just above the navel. Hip: around the fullest part of the hips and seat."
  ),
  p(
    "If you fall between two sizes, size up — our pieces are designed to sit flat without squeezing."
  ),
]

const HOW_TO_MEASURE_KIDS = [
  p(
    "Measure your child in light underclothes, ideally in the morning, and use the larger of the two measurements when between sizes."
  ),
  p(
    "Age ranges are a starting point, not a substitute for measuring — Easewear kids' pieces fit a wide range of body types within the same age."
  ),
]

export async function seedSizeCharts(strapi: any): Promise<void> {
  const charts = [
    {
      category: "women" as const,
      sizes: WOMEN_SIZES,
      how_to_measure: HOW_TO_MEASURE_WOMEN,
    },
    {
      category: "kids" as const,
      sizes: KIDS_SIZES,
      how_to_measure: HOW_TO_MEASURE_KIDS,
    },
  ]

  for (const chart of charts) {
    const existing = await strapi.entityService.findMany(
      "api::size-chart.size-chart",
      { filters: { category: chart.category }, limit: 1 }
    )

    if (Array.isArray(existing) && existing.length > 0) continue

    await strapi.entityService.create("api::size-chart.size-chart", {
      data: {
        ...chart,
        publishedAt: new Date(),
      },
    })
    strapi.log.info(`[seed] size-chart: ${chart.category}`)
  }
}
