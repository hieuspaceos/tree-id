/**
 * GoClaw entities API — GET list entity definitions
 */
import type { APIRoute } from 'astro'
import { listEntityDefinitions } from '@/lib/admin/entity-io'
import { checkFeatureEnabled } from '@/lib/admin/feature-guard'
import { verifyGoclawApiKey } from '@/lib/goclaw/api-auth'
import { json } from '@/lib/api-response'

export const prerender = false


export const GET: APIRoute = async ({ request }) => {
  const fc = await checkFeatureEnabled('goclaw')
  if (!fc.enabled) return fc.response
  const auth = verifyGoclawApiKey(request)
  if (!auth.ok) return auth.response

  const defs = listEntityDefinitions()
  return json({ ok: true, data: { entries: defs, total: defs.length } })
}
