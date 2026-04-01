/**
 * Admin subscribers endpoint — GET list, DELETE by email
 * Auth required (handled by middleware)
 */
import type { APIRoute } from 'astro'
import { checkFeatureEnabled } from '@/lib/admin/feature-guard'
import { getAllSubscribers, getSubscriberCount, removeByEmail } from '@/lib/email/subscriber-io'
import { json } from '@/lib/api-response'

export const prerender = false


/** GET /api/admin/subscribers — list all subscribers */
export const GET: APIRoute = async () => {
  const fc = await checkFeatureEnabled('email')
  if (!fc.enabled) return fc.response
  try {
    const subscribers = getAllSubscribers()
    const count = getSubscriberCount()
    return json({ ok: true, data: { subscribers, count } })
  } catch (err) {
    return json({ ok: false, error: 'Failed to load subscribers' }, 500)
  }
}

/** DELETE /api/admin/subscribers — remove subscriber by email */
export const DELETE: APIRoute = async ({ request }) => {
  const fc2 = await checkFeatureEnabled('email')
  if (!fc2.enabled) return fc2.response
  try {
    const body = await request.json()
    const email = (body?.email ?? '').toString().trim()
    if (!email) return json({ ok: false, error: 'Email is required' }, 400)

    const removed = removeByEmail(email)
    if (!removed) return json({ ok: false, error: 'Subscriber not found' }, 404)

    return json({ ok: true })
  } catch (err) {
    return json({ ok: false, error: 'Delete failed' }, 500)
  }
}
