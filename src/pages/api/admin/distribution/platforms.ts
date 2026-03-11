/**
 * GET /api/admin/distribution/platforms
 * Check which platforms are connected via Postiz
 * Returns: { ok, data: { platforms: string[], configured: boolean } }
 */
import type { APIRoute } from 'astro'
import { isPostizConfigured, getConnectedPlatformMap } from '@/lib/admin/postiz-client'

export const prerender = false

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const GET: APIRoute = async () => {
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
