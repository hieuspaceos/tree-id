/**
 * SaaS Landing Pages API — list + create.
 * All requests require Better Auth session (enforced by middleware).
 * Free plan: max 1 page. Pro: unlimited.
 */
import type { APIRoute } from 'astro'
import { listUserPages, createPage, countUserPages, isSlugTaken } from '@/lib/saas/landing-page-db'
import { isValidSlug } from '@/lib/admin/validation'
import { json } from '@/lib/api-response'

export const prerender = false

const PLAN_LIMITS: Record<string, number> = { free: 1, pro: Infinity }


/** GET /api/saas/landing — list current user's landing pages */
export const GET: APIRoute = async ({ locals }) => {
  const user = (locals as Record<string, any>).saasUser
  if (!user) return json({ ok: false, error: 'Unauthorized' }, 401)

  const pages = await listUserPages(user.id)
  return json({ ok: true, data: { entries: pages, total: pages.length } })
}

/** POST /api/saas/landing — create a new landing page */
export const POST: APIRoute = async ({ locals, request }) => {
  const user = (locals as Record<string, any>).saasUser
  if (!user) return json({ ok: false, error: 'Unauthorized' }, 401)

  try {
    const body = await request.json()
    if (!body.slug || !isValidSlug(body.slug)) {
      return json({ ok: false, error: 'Invalid slug' }, 400)
    }
    if (!body.title) {
      return json({ ok: false, error: 'title required' }, 400)
    }

    // Check plan limit
    const count = await countUserPages(user.id)
    const limit = PLAN_LIMITS[user.plan as string] ?? PLAN_LIMITS.free
    if (count >= limit) {
      return json({ ok: false, error: `Plan limit reached (${limit} page${limit === 1 ? '' : 's'})` }, 403)
    }

    // Check slug uniqueness (global — includes reserved slugs)
    if (await isSlugTaken(body.slug)) {
      return json({ ok: false, error: 'Slug already taken' }, 409)
    }

    const result = await createPage(user.id, body.slug, body.title, body)
    return json({ ok: true, data: result }, 201)
  } catch {
    return json({ ok: false, error: 'Failed to create' }, 500)
  }
}
