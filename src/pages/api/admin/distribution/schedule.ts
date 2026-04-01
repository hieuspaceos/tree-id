/**
 * POST /api/admin/distribution/schedule
 * Schedule a social post to a platform via Postiz API
 * Body: { platform, content, integrationId, scheduledAt? }
 */
import type { APIRoute } from 'astro'
import { schedulePost } from '@/lib/admin/postiz-client'
import { checkFeatureEnabled } from '@/lib/admin/feature-guard'
import { json } from '@/lib/api-response'

export const prerender = false


export const POST: APIRoute = async ({ request }) => {
  const fc = checkFeatureEnabled('distribution')
  if (!fc.enabled) return fc.response
  try {
    const body = await request.json()
    const { platform, content, integrationId, scheduledAt } = body as {
      platform?: string
      content?: string
      integrationId?: string
      scheduledAt?: string
    }

    if (!platform || !content || !integrationId) {
      return json({ ok: false, error: 'Missing platform, content, or integrationId' }, 400)
    }

    // Cap content at 50KB to prevent abuse
    if (content.length > 50_000) {
      return json({ ok: false, error: 'Content too long (max 50KB)' }, 400)
    }

    const result = await schedulePost(platform, content, integrationId, scheduledAt)
    return json({ ok: true, data: result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Schedule failed'
    return json({ ok: false, error: message }, 500)
  }
}
