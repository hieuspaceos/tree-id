/**
 * Product IO types — interface for product config storage.
 */
import type { ProductConfig } from './product-types'

export interface ProductIO {
  list(): Promise<Array<{ slug: string; name: string; description?: string; featuresCount: number; icon?: string }>>
  read(slug: string): Promise<ProductConfig | null>
  write(slug: string, config: ProductConfig): Promise<void>
  delete(slug: string): Promise<boolean>
}

export type { ProductConfig }
