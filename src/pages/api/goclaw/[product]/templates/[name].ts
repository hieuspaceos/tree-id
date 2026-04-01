/**
 * Product-scoped GoClaw template by name — GET single template
 */
import type { APIRoute } from 'astro'
import { readTemplate } from '@/lib/landing/landing-config-reader'
import { verifyProductScope } from '@/lib/goclaw/product-scope'
import { isValidSlug } from '@/lib/admin/validation'
import { json } from '@/lib/api-response'

export const prerender = false


/** GET /api/goclaw/[product]/templates/[name] */
export const GET: APIRoute = async ({ params, request }) => {
  const scope = verifyProductScope(request, params.product)
  if (!scope.ok) return scope.response

  const { name } = params
  if (!name || !isValidSlug(name)) return json({ ok: false, error: 'Invalid template name' }, 400)

  const template = readTemplate(name)
  if (!template) return json({ ok: false, error: 'Template not found' }, 404)
  return json({ ok: true, data: { name, ...template } })
}
