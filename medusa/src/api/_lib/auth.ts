import jwt from "jsonwebtoken"
import { MedusaRequest } from "@medusajs/framework"

export type AuthPayload = {
  sub?: string
  actor_id?: string
  customer_id?: string
  actor_type?: string
  app_metadata?: { customer_id?: string }
}

/**
 * Extract customer id from the Authorization: Bearer <jwt> header.
 * Throws if missing/invalid.
 *
 * Accepts standard JWTs signed with JWT_SECRET. Resolves customer id
 * from the typical claim layout used by Medusa's auth provider:
 *   - app_metadata.customer_id  (Medusa v2 default)
 *   - actor_id  (when actor_type === "customer")
 *   - customer_id
 *   - sub  (fallback)
 */
export function requireCustomerId(req: MedusaRequest): string {
  const authHeader =
    (req.headers.authorization as string | undefined) ??
    (req.headers["Authorization"] as string | undefined)

  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
    throw Object.assign(new Error("Missing bearer token"), { statusCode: 401 })
  }

  const token = authHeader.slice(7).trim()
  const secret = process.env.JWT_SECRET || "supersecret"

  let payload: AuthPayload
  try {
    payload = jwt.verify(token, secret) as AuthPayload
  } catch (err: any) {
    throw Object.assign(new Error("Invalid or expired token"), {
      statusCode: 401,
    })
  }

  const customerId =
    payload.app_metadata?.customer_id ||
    (payload.actor_type === "customer" ? payload.actor_id : undefined) ||
    payload.customer_id ||
    payload.sub

  if (!customerId) {
    throw Object.assign(new Error("Token does not identify a customer"), {
      statusCode: 401,
    })
  }

  return customerId
}
