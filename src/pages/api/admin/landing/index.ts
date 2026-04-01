/**
 * Admin landing pages API — GET list, POST create
 */
import type { APIRoute } from 'astro'
import { listLandingConfigs, readLandingConfig, writeLandingConfig } from '@/lib/landing/landing-config-reader'
import { checkFeatureEnabled } from '@/lib/admin/feature-guard'
import { isValidSlug } from '@/lib/admin/validation'
import { json } from '@/lib/api-response'

export const prerender = false


export const GET: APIRoute = async () => {
  const fc = await checkFeatureEnabled('landing')
  if (!fc.enabled) return fc.response
  const pages = listLandingConfigs()
  return json({ ok: true, data: { entries: pages, total: pages.length } })
}

export const POST: APIRoute = async ({ request }) => {
  const fc = await checkFeatureEnabled('landing')
  if (!fc.enabled) return fc.response
  try {
    const body = await request.json()
    if (!body.slug || !isValidSlug(body.slug)) return json({ ok: false, error: 'Invalid slug' }, 400)
    if (!body.title) return json({ ok: false, error: 'title required' }, 400)
    if (readLandingConfig(body.slug)) return json({ ok: false, error: 'Page already exists' }, 409)
    if (!body.sections) body.sections = []
    writeLandingConfig(body.slug, body)
    return json({ ok: true, data: { slug: body.slug } }, 201)
  } catch { return json({ ok: false, error: 'Failed to create' }, 500) }
}
