import { seedPolicyPages } from "./bootstrap/seed-policy-pages"
import { seedPersonaStories } from "./bootstrap/seed-persona-stories"
import { seedFaqs } from "./bootstrap/seed-faqs"
import { seedFabricTypes } from "./bootstrap/seed-fabric-types"
import { seedSizeCharts } from "./bootstrap/seed-size-charts"
import { grantPublicReadPermissions } from "./bootstrap/permissions"

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    await grantPublicReadPermissions(strapi)

    if (process.env.SKIP_SEED === "true") {
      strapi.log.info("[seed] SKIP_SEED=true — skipping seed bootstrap")
      return
    }

    await seedPolicyPages(strapi)
    await seedPersonaStories(strapi)
    await seedFaqs(strapi)
    await seedFabricTypes(strapi)
    await seedSizeCharts(strapi)
  },
}
