/**
 * Product-scoped GoClaw entities API — GET list entity definitions
 */
import type { APIRoute } from 'astro'
import { listEntityDefinitions } from '@/lib/admin/entity-io'
import { verifyProductScope } from '@/lib/goclaw/product-scope'
import { json } from '@/lib/api-response'

export const prerender = false


/** GET /api/goclaw/[product]/entities — list entity definitions */
export const GET: APIRoute = async ({ params, request }) => {
  const scope = verifyProductScope(request, params.product)
  if (!scope.ok) return scope.response

  const defs = listEntityDefinitions()
  return json({ ok: true, data: { entries: defs, total: defs.length } })
}
