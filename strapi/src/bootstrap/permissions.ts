const PUBLIC_READ_UIDS = [
  "api::persona-story.persona-story",
  "api::faq.faq",
  "api::policy-page.policy-page",
  "api::fabric-type.fabric-type",
  "api::size-chart.size-chart",
] as const

/**
 * Grants find + findOne on the public-facing content types to the Public role.
 * Idempotent — re-running has no effect once permissions exist.
 *
 * Also enables the custom /persona-stories/:slug/product-handles route.
 */
export async function grantPublicReadPermissions(strapi: any): Promise<void> {
  const publicRole = await strapi
    .query("plugin::users-permissions.role")
    .findOne({ where: { type: "public" } })

  if (!publicRole) {
    strapi.log.warn("[permissions] Public role not found — skipping")
    return
  }

  const desired: { action: string }[] = []

  for (const uid of PUBLIC_READ_UIDS) {
    desired.push({ action: `${uid}.find` })
    desired.push({ action: `${uid}.findOne` })
  }
  desired.push({ action: "api::persona-story.custom.productHandles" })

  for (const perm of desired) {
    const existing = await strapi
      .query("plugin::users-permissions.permission")
      .findOne({ where: { action: perm.action, role: publicRole.id } })

    if (!existing) {
      await strapi.query("plugin::users-permissions.permission").create({
        data: { action: perm.action, role: publicRole.id },
      })
      strapi.log.info(`[permissions] +${perm.action}`)
    }
  }
}
