/**
 * Admin entity instance by slug — GET, PUT, DELETE
 */
import type { APIRoute } from 'astro'
import { readEntityInstance, writeEntityInstance, deleteEntityInstance, getEntityDefinition } from '@/lib/admin/entity-io'
import { isValidSlug } from '@/lib/admin/validation'
import { checkFeatureEnabled } from '@/lib/admin/feature-guard'
import { json } from '@/lib/api-response'

export const prerender = false


export const GET: APIRoute = async ({ params }) => {
  const fc = checkFeatureEnabled('entities')
  if (!fc.enabled) return fc.response
  const { name, slug } = params
  if (!name || !isValidSlug(name)) return json({ ok: false, error: 'Invalid entity name' }, 400)
  if (!slug || !isValidSlug(slug)) return json({ ok: false, error: 'Invalid slug' }, 400)
  if (!getEntityDefinition(name)) return json({ ok: false, error: 'Entity definition not found' }, 404)
  const instance = readEntityInstance(name, slug)
  if (!instance) return json({ ok: false, error: 'Not found' }, 404)
  return json({ ok: true, data: instance })
}

export const PUT: APIRoute = async ({ params, request }) => {
  const fc = checkFeatureEnabled('entities')
  if (!fc.enabled) return fc.response
  const { name, slug } = params
  if (!name || !isValidSlug(name)) return json({ ok: false, error: 'Invalid entity name' }, 400)
  if (!slug || !isValidSlug(slug)) return json({ ok: false, error: 'Invalid slug' }, 400)
  if (!getEntityDefinition(name)) return json({ ok: false, error: 'Entity definition not found' }, 404)
  if (!readEntityInstance(name, slug)) return json({ ok: false, error: 'Not found' }, 404)
  try {
    const body = await request.json() as Record<string, unknown>
    writeEntityInstance(name, slug, body)
    return json({ ok: true, data: { slug } })
  } catch { return json({ ok: false, error: 'Failed to update' }, 500) }
}

export const DELETE: APIRoute = async ({ params }) => {
  const fc = checkFeatureEnabled('entities')
  if (!fc.enabled) return fc.response
  const { name, slug } = params
  if (!name || !isValidSlug(name)) return json({ ok: false, error: 'Invalid entity name' }, 400)
  if (!slug || !isValidSlug(slug)) return json({ ok: false, error: 'Invalid slug' }, 400)
  const deleted = deleteEntityInstance(name!, slug!)
  if (!deleted) return json({ ok: false, error: 'Not found' }, 404)
  return json({ ok: true, data: { slug } })
}
