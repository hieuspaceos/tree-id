import type { APIRoute } from 'astro'
import { getManifest } from '@/lib/r2/upload-manifest'

// Must be SSR — reads from R2 at request time
export const prerender = false

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug

  // Validate slug format to prevent path traversal
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return new Response(JSON.stringify({ error: 'Invalid slug' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const manifest = await getManifest(slug)
    if (!manifest) {
      return new Response(JSON.stringify({ error: 'Manifest not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify(manifest), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
