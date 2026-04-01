/**
 * Admin landing page by slug — GET read, PUT update, DELETE
 */
import type { APIRoute } from 'astro'
import { readLandingConfig, writeLandingConfig, deleteLandingConfig } from '@/lib/landing/landing-config-reader'
import { checkFeatureEnabled } from '@/lib/admin/feature-guard'
import { isValidSlug } from '@/lib/admin/validation'
import { json } from '@/lib/api-response'

export const prerender = false


export const GET: APIRoute = async ({ params }) => {
  const fc = checkFeatureEnabled('landing')
  if (!fc.enabled) return fc.response
  const { slug } = params
  if (!slug || !isValidSlug(slug)) return json({ ok: false, error: 'Invalid slug' }, 400)
  const config = readLandingConfig(slug)
  if (!config) return json({ ok: false, error: 'Not found' }, 404)
  return json({ ok: true, data: config })
}

export const PUT: APIRoute = async ({ params, request }) => {
  const fc = checkFeatureEnabled('landing')
  if (!fc.enabled) return fc.response
  const { slug } = params
  if (!slug || !isValidSlug(slug)) return json({ ok: false, error: 'Invalid slug' }, 400)
  if (!readLandingConfig(slug)) return json({ ok: false, error: 'Not found' }, 404)
  try {
    const body = await request.json()
    if (!body.title) return json({ ok: false, error: 'title required' }, 400)
    writeLandingConfig(slug, { ...body, slug })
    return json({ ok: true, data: { slug } })
  } catch { return json({ ok: false, error: 'Failed to update' }, 500) }
}

export const DELETE: APIRoute = async ({ params }) => {
  const fc = checkFeatureEnabled('landing')
  if (!fc.enabled) return fc.response
  const { slug } = params
  if (!slug || !isValidSlug(slug)) return json({ ok: false, error: 'Invalid slug' }, 400)
  const deleted = deleteLandingConfig(slug)
  if (!deleted) return json({ ok: false, error: 'Not found' }, 404)
  return json({ ok: true, data: { slug } })
}
