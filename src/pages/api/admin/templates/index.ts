/**
 * Admin templates API — GET list all templates, GET read single template
 */
import type { APIRoute } from 'astro'
import { listTemplates, readTemplate } from '@/lib/landing/landing-config-reader'
import { checkFeatureEnabled } from '@/lib/admin/feature-guard'

export const prerender = false

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

export const GET: APIRoute = async ({ url }) => {
  const fc = checkFeatureEnabled('landing')
  if (!fc.enabled) return fc.response

  const name = url.searchParams.get('name')
  if (name) {
    const template = readTemplate(name)
    if (!template) return json({ ok: false, error: 'Template not found' }, 404)
    return json({ ok: true, data: { name, ...template } })
  }

  const templates = listTemplates()
  return json({ ok: true, data: { entries: templates, total: templates.length } })
}
