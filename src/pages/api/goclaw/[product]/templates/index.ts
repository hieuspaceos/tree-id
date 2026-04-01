/**
 * Product-scoped GoClaw templates API — GET list all templates
 */
import type { APIRoute } from 'astro'
import { listTemplates } from '@/lib/landing/landing-config-reader'
import { verifyProductScope } from '@/lib/goclaw/product-scope'
import { json } from '@/lib/api-response'

export const prerender = false


/** GET /api/goclaw/[product]/templates */
export const GET: APIRoute = async ({ params, request }) => {
  const scope = verifyProductScope(request, params.product)
  if (!scope.ok) return scope.response

  const templates = listTemplates()
  return json({ ok: true, data: { entries: templates, total: templates.length } })
}
