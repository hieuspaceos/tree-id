/**
 * Product API authentication middleware
 * Validates JWT session + product existence + resource access
 * Used by /api/products/[slug]/... endpoints
 */
import { verifyToken, COOKIE_NAME, timingSafeCompare } from './auth'
import { getProductIO } from './product-io'
import type { ProductConfig } from './product-types'

/** Result of product access validation */
export interface ProductAuthResult {
  ok: boolean
  product?: ProductConfig
  error?: string
  status?: number
}

/** Read product config via IO factory */
export async function readProductConfig(slug: string): Promise<ProductConfig | null> {
  return getProductIO().read(slug)
}

/**
 * Validate request has access to a product and its resources.
 * Accepts session cookie JWT (admin users) or Authorization Bearer token (product API key).
 */
export async function validateProductAccess(
  request: Request,
  productSlug: string,
): Promise<ProductAuthResult> {
  // 1. Load product config via IO factory
  const product = await readProductConfig(productSlug)
  if (!product) {
    return { ok: false, error: 'Product not found', status: 404 }
  }

  // 2. Validate auth — try cookie JWT first, then Bearer token
  const cookieHeader = request.headers.get('cookie') || ''
  const cookieMatch = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`))
  const cookieToken = cookieMatch ? cookieMatch[1] : null

  const authHeader = request.headers.get('Authorization') || ''
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  // Try JWT session cookie
  if (cookieToken) {
    const payload = await verifyToken(cookieToken)
    if (payload) {
      // Product-scoped JWT: must match the requested product slug
      // Core admin JWT (no `product` field) has full access to any product
      const jwtProduct = payload.product as string | undefined
      if (jwtProduct && jwtProduct !== productSlug) {
        return { ok: false, error: 'Forbidden: product access mismatch', status: 403 }
      }
      return { ok: true, product }
    }
  }

  // Try Bearer token against dedicated ADMIN_API_KEY (never reuse JWT signing secret)
  if (bearerToken) {
    const adminApiKey = import.meta.env.ADMIN_API_KEY || process.env.ADMIN_API_KEY
    if (adminApiKey && adminApiKey.length > 0) {
      const match = await timingSafeCompare(bearerToken, adminApiKey)
      if (match) return { ok: true, product }
    }
  }

  return { ok: false, error: 'Unauthorized', status: 401 }
}

/** Check if a collection is in the product's allowed list */
export function isCollectionAllowed(product: ProductConfig, collection: string): boolean {
  return product.coreCollections.includes(collection)
}

/** Check if a feature is in the product's allowed list */
export function isFeatureAllowed(product: ProductConfig, feature: string): boolean {
  return product.features.includes(feature)
}
