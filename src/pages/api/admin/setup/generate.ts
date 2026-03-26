/**
 * Admin setup generate API — POST to generate landing page config via Gemini Flash
 */
import type { APIRoute } from 'astro'
import { generateLandingPageFromDescription } from '@/lib/landing/ai-setup-generator'
import { checkFeatureEnabled } from '@/lib/admin/feature-guard'
import { isValidSlug } from '@/lib/admin/validation'

export const prerender = false

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

export const POST: APIRoute = async ({ request }) => {
  const fc = checkFeatureEnabled('setup-wizard')
  if (!fc.enabled) return fc.response

  if (!import.meta.env.GEMINI_API_KEY) {
    return json({ ok: false, error: 'GEMINI_API_KEY not configured' }, 503)
  }

  try {
    const body = await request.json() as Record<string, unknown>
    const description = body.description as string
    const slug = (body.slug as string) || 'landing'

    if (!description || description.trim().length < 10) {
      return json({ ok: false, error: 'description must be at least 10 characters' }, 400)
    }
    if (!isValidSlug(slug)) {
      return json({ ok: false, error: 'Invalid slug' }, 400)
    }

    const config = await generateLandingPageFromDescription(description.trim(), slug)
    if (!config) {
      return json({ ok: false, error: 'AI generation failed. Check GEMINI_API_KEY.' }, 500)
    }

    return json({ ok: true, data: config })
  } catch {
    return json({ ok: false, error: 'Failed to generate' }, 500)
  }
}
