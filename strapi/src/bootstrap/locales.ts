/**
 * Ensure the locales the storefront uses are registered with Strapi's i18n
 * plugin. Idempotent — re-running has no effect once each locale exists.
 *
 * Default locale stays `en` (Strapi's default on install).
 */
const REQUIRED_LOCALES = [
  { code: "en", name: "English (en)" },
  { code: "ar", name: "Arabic (ar)" },
] as const

export async function ensureLocales(strapi: any): Promise<void> {
  const localesService = strapi.plugin("i18n").service("locales")
  const existing: { code: string }[] = await localesService.find()
  const existingCodes = new Set(existing.map((l) => l.code))

  for (const locale of REQUIRED_LOCALES) {
    if (existingCodes.has(locale.code)) continue
    await localesService.create({ code: locale.code, name: locale.name })
    strapi.log.info(`[locales] +${locale.code}`)
  }
}
