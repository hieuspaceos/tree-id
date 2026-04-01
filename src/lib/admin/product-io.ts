/**
 * Product IO barrel — backward-compat re-exports + factory.
 */
export type { ProductIO } from './product-io-types'

// Backward-compat
export { listProducts, readProduct, writeProduct, deleteProduct } from './product-io-local'

import type { ProductIO } from './product-io-types'
import { TursoProductIO } from './product-io-turso'
import * as local from './product-io-local'

// ── Factory ──

let _instance: ProductIO | null = null

export function getProductIO(db?: any): ProductIO {
  if (db) return new TursoProductIO(db)
  if (_instance) return _instance
  if (import.meta.env.PROD && import.meta.env.TURSO_URL) {
    _instance = new TursoProductIO()
  } else {
    _instance = {
      list: async () => local.listProducts(),
      read: async (slug) => local.readProduct(slug),
      write: async (slug, config) => local.writeProduct(slug, config),
      delete: async (slug) => local.deleteProduct(slug),
    }
  }
  return _instance
}
