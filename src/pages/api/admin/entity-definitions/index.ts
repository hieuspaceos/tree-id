/**
 * Admin entity definitions API — GET list, POST create definition
 */
import type { APIRoute } from 'astro'
import { listEntityDefinitions, getEntityDefinition, writeEntityDefinition } from '@/lib/admin/entity-io'
import { isValidSlug } from '@/lib/admin/validation'
import { checkFeatureEnabled } from '@/lib/admin/feature-guard'
import { json } from '@/lib/api-response'

export const prerender = false


export const GET: APIRoute = async () => {
  const fc = await checkFeatureEnabled('entities')
  if (!fc.enabled) return fc.response
  const defs = listEntityDefinitions()
  return json({ ok: true, data: { entries: defs, total: defs.length } })
}

export const POST: APIRoute = async ({ request }) => {
  const fc = await checkFeatureEnabled('entities')
  if (!fc.enabled) return fc.response
  try {
    const body = await request.json() as Record<string, unknown>
    const name = body.name as string
    if (!name || !isValidSlug(name)) return json({ ok: false, error: 'Invalid entity name (use kebab-case)' }, 400)
    if (!body.label) return json({ ok: false, error: 'label required' }, 400)
    if (getEntityDefinition(name)) return json({ ok: false, error: 'Entity already exists' }, 409)
    const { name: _n, ...rest } = body
    writeEntityDefinition(name, { label: body.label as string, fields: (body.fields as any) || [], ...rest } as any)
    return json({ ok: true, data: { name } }, 201)
  } catch { return json({ ok: false, error: 'Failed to create' }, 500) }
}
