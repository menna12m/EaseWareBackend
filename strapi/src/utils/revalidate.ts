import axios from "axios"

/**
 * Fire-and-forget ISR revalidation to the Next.js frontend.
 *
 * Posts to ${NEXT_FRONTEND_URL}/api/revalidate with:
 *   { secret: REVALIDATE_SECRET, tag: <tag> }
 *
 * Errors are swallowed and logged — a failed revalidate must not block the
 * underlying content mutation.
 */
export async function revalidate(tag: string): Promise<void> {
  const base = process.env.NEXT_FRONTEND_URL
  const secret = process.env.REVALIDATE_SECRET

  if (!base || !secret) {
    strapi.log.warn(
      `[revalidate:${tag}] NEXT_FRONTEND_URL or REVALIDATE_SECRET not set — skipping`
    )
    return
  }

  try {
    await axios.post(
      `${base.replace(/\/$/, "")}/api/revalidate`,
      { secret, tag },
      { timeout: 5000 }
    )
    strapi.log.info(`[revalidate:${tag}] OK`)
  } catch (err: any) {
    strapi.log.error(
      `[revalidate:${tag}] failed: ${err?.response?.status ?? ""} ${err?.message}`
    )
  }
}
