/**
 * Product landing pages API — GET list, POST create
 * Requires 'landing' in product's features list
 */
import type { APIRoute } from 'astro'
import { listLandingConfigs, readLandingConfig, writeLandingConfig } from '@/lib/landing/landing-config-reader'
import { validateProductAccess, isFeatureAllowed } from '@/lib/admin/product-api-auth'
import { isValidSlug } from '@/lib/admin/validation'
import { json } from '@/lib/api-response'

export const prerender = false


/** GET /api/products/[slug]/landing — list landing pages */
export const GET: APIRoute = async ({ params, request }) => {
  const { slug } = params
  if (!slug) return json({ ok: false, error: 'Missing product slug' }, 400)

  const auth = await validateProductAccess(request, slug)
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status ?? 401)

  const hasLandingFeature = isFeatureAllowed(auth.product!, 'landing')

  if (hasLandingFeature) {
    // Full landing module — list all pages
    const pages = listLandingConfigs()
    return json({ ok: true, data: { entries: pages, total: pages.length } })
  }

  // No landing module — only return product's own landing page
  const ownSlug = auth.product!.landingPage
  if (!ownSlug) return json({ ok: true, data: { entries: [], total: 0 } })
  const own = readLandingConfig(ownSlug)
  const entries = own ? [{ slug: ownSlug, title: own.title, sectionCount: own.sections?.length ?? 0 }] : []
  return json({ ok: true, data: { entries, total: entries.length } })
}

/** POST /api/products/[slug]/landing — create landing page */
export const POST: APIRoute = async ({ params, request }) => {
  const { slug } = params
  if (!slug) return json({ ok: false, error: 'Missing product slug' }, 400)

  const auth = await validateProductAccess(request, slug)
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status ?? 401)

  if (!isFeatureAllowed(auth.product!, 'landing')) {
    return json({ ok: false, error: 'Enable "landing" feature to create additional pages' }, 403)
  }

  try {
    const body = await request.json()
    if (!body.slug || !isValidSlug(body.slug)) return json({ ok: false, error: 'Invalid slug' }, 400)
    if (!body.title) return json({ ok: false, error: 'title required' }, 400)
    if (readLandingConfig(body.slug)) return json({ ok: false, error: 'Page already exists' }, 409)
    if (!body.sections) body.sections = []
    writeLandingConfig(body.slug, body)
    return json({ ok: true, data: { slug: body.slug } }, 201)
  } catch {
    return json({ ok: false, error: 'Failed to create' }, 500)
  }
}
