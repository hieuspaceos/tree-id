import type { APIRoute } from 'astro'
import { createServerSupabase } from '@/lib/supabase/client'
import { listProducts } from '@/lib/supabase/marketplace-queries'

/** GET /api/marketplace/products?category=tool */
export const GET: APIRoute = async ({ url }) => {
  try {
    const client = createServerSupabase()
    const category = url.searchParams.get('category') || undefined
    const products = await listProducts(client, category)
    return new Response(JSON.stringify(products), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    // Graceful fallback when Supabase is not configured
    if (error instanceof Error && error.message.includes('Missing Supabase')) {
      return new Response(JSON.stringify({ message: 'Supabase not configured', products: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    return new Response(JSON.stringify({ error: 'Failed to fetch products' }), { status: 500 })
  }
}
