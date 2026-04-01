/**
 * TursoProductIO — product configs via Turso DB.
 */
import { eq } from 'drizzle-orm'
import { getDb } from '@/db/client'
import { productConfigs } from '@/db/schema-content'
import type { ProductIO } from './product-io-types'
import type { ProductConfig } from './product-types'

export class TursoProductIO implements ProductIO {
  private db: ReturnType<typeof getDb>
  constructor(db?: ReturnType<typeof getDb>) { this.db = db || getDb() }

  async list(): Promise<Array<{ slug: string; name: string; description?: string; featuresCount: number; icon?: string }>> {
    const rows = await this.db.select().from(productConfigs)
    return rows.map(r => {
      const cfg = JSON.parse(r.config || '{}')
      return { slug: r.slug, name: r.name, description: r.description || undefined,
        featuresCount: cfg.features?.length ?? 0, icon: r.icon || undefined }
    })
  }

  async read(slug: string): Promise<ProductConfig | null> {
    const [row] = await this.db.select().from(productConfigs).where(eq(productConfigs.slug, slug))
    if (!row) return null
    const cfg = JSON.parse(row.config || '{}')
    return { slug, name: row.name, description: row.description || undefined,
      icon: row.icon || undefined, features: [], coreCollections: [], ...cfg } as ProductConfig
  }

  async write(slug: string, config: ProductConfig): Promise<void> {
    const { name, description, icon, slug: _s, ...rest } = config
    const now = new Date().toISOString()
    await this.db.insert(productConfigs).values({
      slug, name: name || slug, description: description || null, icon: icon || null,
      config: JSON.stringify(rest), createdAt: now, updatedAt: now,
    }).onConflictDoUpdate({
      target: productConfigs.slug,
      set: { name: name || slug, description: description || null, icon: icon || null,
        config: JSON.stringify(rest), updatedAt: now },
    })
  }

  async delete(slug: string): Promise<boolean> {
    const result = await this.db.delete(productConfigs).where(eq(productConfigs.slug, slug))
    return (result as any).rowsAffected > 0
  }
}
