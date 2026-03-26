/**
 * Admin products API — GET list all products, POST create new product
 */
import type { APIRoute } from 'astro'
import { listProducts, readProduct, writeProduct } from '@/lib/admin/product-io'
import { readLandingConfig, writeLandingConfig } from '@/lib/landing/landing-config-reader'
import { isValidSlug } from '@/lib/admin/validation'

export const prerender = false

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

export const GET: APIRoute = async () => {
  const products = listProducts()
  return json({ ok: true, data: { entries: products, total: products.length } })
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    if (!body.slug || !isValidSlug(body.slug)) return json({ ok: false, error: 'Invalid slug' }, 400)
    if (!body.name) return json({ ok: false, error: 'name required' }, 400)
    if (readProduct(body.slug)) return json({ ok: false, error: 'Product already exists' }, 409)
    if (!Array.isArray(body.features)) body.features = []
    if (!Array.isArray(body.coreCollections)) body.coreCollections = []

    // Auto-create landing page for the product if one doesn't exist
    const lpSlug = body.slug
    if (!readLandingConfig(lpSlug)) {
      writeLandingConfig(lpSlug, {
        slug: lpSlug,
        title: `${body.name}`,
        sections: [
          { type: 'nav', order: -1, enabled: true, data: { brandName: body.name, links: [] } },
          { type: 'hero', order: 0, enabled: true, data: { headline: body.name, subheadline: body.description || 'Welcome', cta: { text: 'Get Started', url: '#' } } },
          { type: 'features', order: 1, enabled: true, data: { heading: 'Features', items: [{ title: 'Feature 1', description: 'Description' }] } },
          { type: 'cta', order: 2, enabled: true, data: { headline: 'Ready to start?', cta: { text: 'Get Started', url: '#' } } },
          { type: 'footer', order: 999, enabled: true, data: { text: `© ${new Date().getFullYear()} ${body.name}`, links: [] } },
        ],
      } as any)
    }

    // Link landing page and ensure 'landing' feature is included
    body.landingPage = lpSlug
    if (!body.features.includes('landing')) body.features.push('landing')

    writeProduct(body.slug, body)
    return json({ ok: true, data: { slug: body.slug } }, 201)
  } catch {
    return json({ ok: false, error: 'Failed to create' }, 500)
  }
}
