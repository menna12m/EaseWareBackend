/**
 * Single-types only have one row per locale. We create one entry per locale
 * (en + ar) on first boot, pre-populated with the same copy as the frontend's
 * messages/en.json + ar.json so the first render matches what was there.
 *
 * Subsequent boots see entries exist and leave them alone.
 */

type HeroSeed = {
  hero_eyebrow: string
  hero_title: string
  hero_body: string
  hero_shop_cta: string
  hero_story_cta: string
  hero_image_alt: string
}

const SEEDS: Record<string, HeroSeed> = {
  en: {
    hero_eyebrow: "Comfort-wear, made in Egypt",
    hero_title: "The softest thing you'll wear today.",
    hero_body:
      "Easewear is built for the women who do everything — and want to feel like themselves while doing it. Layer it, live in it, love it.",
    hero_shop_cta: "Shop the collection",
    hero_story_cta: "By story",
    hero_image_alt: "Easewear hero — woman in vanilla loungewear",
  },
  ar: {
    hero_eyebrow: "ملابس مريحة، صُنعت في مصر",
    hero_title: "أنعم ما سترتدينه اليوم.",
    hero_body:
      "easewear صُممت للمرأة التي تفعل كل شيء — وتريد أن تشعر بأنها هي بينما تفعله. ارتديها طبقات، عيشي فيها، أحبيها.",
    hero_shop_cta: "تسوقي المجموعة",
    hero_story_cta: "حسب القصة",
    hero_image_alt: "هير إيس وير — امرأة بملابس بيج",
  },
}

export async function seedHomePage(strapi: any): Promise<void> {
  for (const [locale, data] of Object.entries(SEEDS)) {
    const existing = await strapi.entityService.findMany(
      "api::home-page.home-page",
      { locale } as any
    )
    if (existing) continue

    await strapi.entityService.create("api::home-page.home-page", {
      data: {
        ...data,
        locale,
        publishedAt: new Date(),
      } as any,
    })
    strapi.log.info(`[seed] home-page (${locale}) created`)
  }
}
