/**
 * GET /api/admin/distribution/platforms
 * Check which platforms are connected via Postiz
 * Returns: { ok, data: { platforms: string[], configured: boolean } }
 */
import type { APIRoute } from 'astro'
import { isPostizConfigured, getConnectedPlatformMap } from '@/lib/admin/postiz-client'
import { checkFeatureEnabled } from '@/lib/admin/feature-guard'
import { json } from '@/lib/api-response'

export const prerender = false


export const GET: APIRoute = async () => {
  const fc = await checkFeatureEnabled('distribution')
  if (!fc.enabled) return fc.response
  try {
    const configured = isPostizConfigured()
    if (!configured) {
      return json({ ok: true, data: { platforms: [], integrationMap: {}, configured: false } })
    }

    const integrationMap = await getConnectedPlatformMap()
    const platforms = Object.keys(integrationMap)
    return json({ ok: true, data: { platforms, integrationMap, configured: true } })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to check platforms'
    return json({ ok: false, error: message }, 500)
  }
}
