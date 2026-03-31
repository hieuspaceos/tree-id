/**
 * SaaS Landing Page API — read, update, delete by slug.
 * All requests scoped to authenticated user's pages only.
 */
import type { APIRoute } from 'astro'
import { getUserPage, updatePage, deletePage } from '@/lib/saas/landing-page-db'
import { isValidSlug } from '@/lib/admin/validation'

export const prerender = false

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

/** GET /api/saas/landing/:slug — get a single landing page */
export const GET: APIRoute = async ({ locals, params }) => {
  const user = (locals as Record<string, any>).saasUser
  if (!user) return json({ ok: false, error: 'Unauthorized' }, 401)

  const { slug } = params
  if (!slug || !isValidSlug(slug)) return json({ ok: false, error: 'Invalid slug' }, 400)

  const page = await getUserPage(user.id, slug)
  if (!page) return json({ ok: false, error: 'Not found' }, 404)

  return json({ ok: true, data: { ...page, config: JSON.parse(page.config) } })
}

/** PUT /api/saas/landing/:slug — update a landing page */
export const PUT: APIRoute = async ({ locals, params, request }) => {
  const user = (locals as Record<string, any>).saasUser
  if (!user) return json({ ok: false, error: 'Unauthorized' }, 401)

  const { slug } = params
  if (!slug || !isValidSlug(slug)) return json({ ok: false, error: 'Invalid slug' }, 400)

  try {
    const body = await request.json()
    const updated = await updatePage(user.id, slug, {
      name: body.title,
      config: body,
      published: body.published,
    })
    if (!updated) return json({ ok: false, error: 'Not found' }, 404)
    return json({ ok: true, data: { slug } })
  } catch {
    return json({ ok: false, error: 'Failed to update' }, 500)
  }
}

/** DELETE /api/saas/landing/:slug — delete a landing page */
export const DELETE: APIRoute = async ({ locals, params }) => {
  const user = (locals as Record<string, any>).saasUser
  if (!user) return json({ ok: false, error: 'Unauthorized' }, 401)

  const { slug } = params
  if (!slug || !isValidSlug(slug)) return json({ ok: false, error: 'Invalid slug' }, 400)

  const deleted = await deletePage(user.id, slug)
  if (!deleted) return json({ ok: false, error: 'Not found' }, 404)
  return json({ ok: true, data: { slug } })
}
