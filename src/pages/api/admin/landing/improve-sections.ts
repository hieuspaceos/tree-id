/**
 * Improve specific sections of an existing landing page via AI.
 * POST { slug, sectionIndices?, url? }
 * - slug: landing page slug
 * - sectionIndices: optional array of section indices to improve (default: all poor/partial)
 * - url: optional source URL for fetching page content as context
 */
import type { APIRoute } from 'astro'
import { improveSections } from '@/lib/admin/landing-clone-ai'
import { readLandingConfig } from '@/lib/landing/landing-config-reader'
import { json } from '@/lib/api-response'

export const prerender = false


export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const slug = body?.slug?.trim()
    if (!slug) return json({ ok: false, error: 'slug is required' }, 400)

    const config = readLandingConfig(slug)
    if (!config) return json({ ok: false, error: `Landing page "${slug}" not found` }, 404)

    // If no indices specified, find all poor/partial sections automatically
    let indices: number[] = body.sectionIndices
    if (!Array.isArray(indices) || indices.length === 0) {
      indices = (config.sections || []).map((s, i) => {
        const d = (s.data || {}) as Record<string, unknown>
        const vals = Object.values(d).filter(v => v != null && v !== '')
        const hasHeading = !!(d.headline || d.heading || d.brandName || d.text || d.content)
        const isListType = ['features', 'stats', 'faq', 'how-it-works', 'testimonials', 'pricing', 'team', 'gallery'].includes(s.type)
        const itemKey = s.type === 'team' ? 'members' : s.type === 'gallery' ? 'images' : s.type === 'pricing' ? 'plans' : 'items'
        const items = d[itemKey]

        // Detect poor/partial quality
        if (vals.length === 0) return i
        if (!hasHeading && !['divider', 'social-proof', 'nav', 'footer', 'image', 'video', 'map'].includes(s.type)) return i
        if (isListType && (!Array.isArray(items) || items.length <= 1)) return i
        return -1
      }).filter(i => i >= 0)
    }

    if (indices.length === 0) return json({ ok: true, data: { improved: 0, message: 'All sections are already good quality' } })

    const result = await improveSections(slug, indices, body.url)
    return json({ ok: true, data: result })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Improve failed'
    return json({ ok: false, error: msg }, 500)
  }
}
