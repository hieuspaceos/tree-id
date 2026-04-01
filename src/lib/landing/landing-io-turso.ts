/**
 * TursoLandingIO — landing page configs + templates via Turso DB.
 */
import { eq } from 'drizzle-orm'
import { getDb } from '@/db/client'
import { ownerLandingPages, landingTemplates } from '@/db/schema-content'
import type { LandingIO } from './landing-io-types'
import type { LandingPageConfig } from './landing-types'

export class TursoLandingIO implements LandingIO {
  private db: ReturnType<typeof getDb>
  constructor(db?: ReturnType<typeof getDb>) { this.db = db || getDb() }

  async readConfig(slug: string): Promise<LandingPageConfig | null> {
    const [row] = await this.db.select().from(ownerLandingPages).where(eq(ownerLandingPages.slug, slug))
    if (!row) return null
    return { slug, ...JSON.parse(row.config || '{}') } as LandingPageConfig
  }

  async writeConfig(slug: string, config: LandingPageConfig): Promise<void> {
    const { slug: _s, ...rest } = config
    const now = new Date().toISOString()
    await this.db.insert(ownerLandingPages).values({
      slug, title: config.title || slug, template: (config as any).template || null,
      config: JSON.stringify(rest), createdAt: now, updatedAt: now,
    }).onConflictDoUpdate({
      target: ownerLandingPages.slug,
      set: { title: config.title || slug, config: JSON.stringify(rest), updatedAt: now },
    })
  }

  async deleteConfig(slug: string): Promise<boolean> {
    const result = await this.db.delete(ownerLandingPages).where(eq(ownerLandingPages.slug, slug))
    return (result as any).rowsAffected > 0
  }

  async listConfigs(): Promise<Array<{ slug: string; title: string; template?: string; sectionCount: number }>> {
    const rows = await this.db.select().from(ownerLandingPages)
    return rows.map(r => {
      const cfg = JSON.parse(r.config || '{}')
      return { slug: r.slug, title: r.title, template: r.template || undefined, sectionCount: cfg.sections?.length ?? 0 }
    })
  }

  async readTemplate(name: string): Promise<Record<string, unknown> | null> {
    const [row] = await this.db.select().from(landingTemplates).where(eq(landingTemplates.name, name))
    if (!row) return null
    return JSON.parse(row.config || '{}')
  }

  async listTemplates(): Promise<Array<{ name: string; description?: string; targetAudience?: string }>> {
    const rows = await this.db.select().from(landingTemplates)
    return rows.map(r => ({ name: r.name, description: r.description || undefined, targetAudience: r.targetAudience || undefined }))
  }
}
