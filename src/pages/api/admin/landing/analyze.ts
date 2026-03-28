/**
 * Pre-clone site compatibility check — analyzes URL without calling AI.
 * Returns tier, score, framework, and recommendations.
 */
import type { APIRoute } from 'astro'
import { analyzeSiteCompatibility } from '@/lib/admin/landing-clone-ai'

export const POST: APIRoute = async ({ request }) => {
  const { url } = await request.json()
  if (!url) return new Response(JSON.stringify({ error: 'URL required' }), { status: 400 })

  try {
    const analysis = await analyzeSiteCompatibility(url)
    return new Response(JSON.stringify(analysis), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 })
  }
}
