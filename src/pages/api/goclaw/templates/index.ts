/**
 * GoClaw templates API — GET list all templates
 */
import type { APIRoute } from 'astro'
import { listTemplates } from '@/lib/landing/landing-config-reader'
import { checkFeatureEnabled } from '@/lib/admin/feature-guard'
import { verifyGoclawApiKey } from '@/lib/goclaw/api-auth'
import { json } from '@/lib/api-response'

export const prerender = false


export const GET: APIRoute = async ({ request }) => {
  const fc = checkFeatureEnabled('goclaw')
  if (!fc.enabled) return fc.response
  const auth = verifyGoclawApiKey(request)
  if (!auth.ok) return auth.response

  const templates = listTemplates()
  return json({ ok: true, data: { entries: templates, total: templates.length } })
}
