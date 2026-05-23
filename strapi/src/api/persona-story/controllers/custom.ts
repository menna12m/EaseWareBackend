import type { Context } from "koa"

export default {
  async productHandles(ctx: Context) {
    const { slug } = ctx.params

    const entries = await strapi.entityService.findMany(
      "api::persona-story.persona-story",
      {
        filters: { slug: { $eq: slug } },
        fields: ["product_tags"],
        publicationState: "live",
        limit: 1,
      } as any
    )

    const story = Array.isArray(entries) ? entries[0] : entries

    if (!story) {
      return ctx.notFound(`Persona story '${slug}' not found`)
    }

    const tags = Array.isArray((story as any).product_tags)
      ? (story as any).product_tags
      : []

    ctx.body = { product_tags: tags }
  },
}
