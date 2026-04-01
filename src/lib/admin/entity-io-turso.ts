/**
 * TursoEntityIO — entity definitions + instances via Turso DB.
 */
import { eq, and } from 'drizzle-orm'
import { getDb } from '@/db/client'
import { entityDefinitions, entityInstances } from '@/db/schema-content'
import type { EntityIO, EntityDefinition, EntityInstance, EntityPublicConfig } from './entity-io-types'

export class TursoEntityIO implements EntityIO {
  private db: ReturnType<typeof getDb>
  constructor(db?: ReturnType<typeof getDb>) { this.db = db || getDb() }

  async listDefinitions(): Promise<EntityDefinition[]> {
    const rows = await this.db.select().from(entityDefinitions)
    return rows.map(r => this.rowToDef(r))
  }

  async getDefinition(name: string): Promise<EntityDefinition | null> {
    const [row] = await this.db.select().from(entityDefinitions).where(eq(entityDefinitions.name, name))
    return row ? this.rowToDef(row) : null
  }

  async writeDefinition(name: string, def: Omit<EntityDefinition, 'name'>): Promise<void> {
    const now = new Date().toISOString()
    await this.db.insert(entityDefinitions).values({
      name, label: def.label, description: def.description || null,
      fields: JSON.stringify(def.fields || []),
      publicConfig: def.public ? JSON.stringify(def.public) : null,
      createdAt: now, updatedAt: now,
    }).onConflictDoUpdate({
      target: entityDefinitions.name,
      set: { label: def.label, description: def.description || null,
        fields: JSON.stringify(def.fields || []),
        publicConfig: def.public ? JSON.stringify(def.public) : null, updatedAt: now },
    })
  }

  async deleteDefinition(name: string): Promise<boolean> {
    const result = await this.db.delete(entityDefinitions).where(eq(entityDefinitions.name, name))
    return (result as any).rowsAffected > 0
  }

  async listPublicDefinitions(): Promise<EntityDefinition[]> {
    const all = await this.listDefinitions()
    return all.filter(d => d.public?.enabled === true)
  }

  async getPublicConfig(name: string): Promise<EntityPublicConfig | null> {
    const def = await this.getDefinition(name)
    return def?.public?.enabled ? def.public : null
  }

  async listInstances(entityName: string): Promise<EntityInstance[]> {
    const rows = await this.db.select().from(entityInstances)
      .where(eq(entityInstances.entityName, entityName))
    return rows.map(r => ({ slug: r.slug, ...JSON.parse(r.data || '{}') }))
  }

  async readInstance(entityName: string, slug: string): Promise<EntityInstance | null> {
    const [row] = await this.db.select().from(entityInstances)
      .where(and(eq(entityInstances.entityName, entityName), eq(entityInstances.slug, slug)))
    return row ? { slug: row.slug, ...JSON.parse(row.data || '{}') } : null
  }

  async writeInstance(entityName: string, slug: string, data: Record<string, unknown>): Promise<void> {
    const { slug: _s, ...rest } = data
    const now = new Date().toISOString()
    await this.db.insert(entityInstances).values({
      id: crypto.randomUUID(), entityName, slug, data: JSON.stringify(rest),
      createdAt: now, updatedAt: now,
    }).onConflictDoUpdate({
      target: [entityInstances.entityName, entityInstances.slug],
      set: { data: JSON.stringify(rest), updatedAt: now },
    })
  }

  async deleteInstance(entityName: string, slug: string): Promise<boolean> {
    const result = await this.db.delete(entityInstances)
      .where(and(eq(entityInstances.entityName, entityName), eq(entityInstances.slug, slug)))
    return (result as any).rowsAffected > 0
  }

  private rowToDef(r: typeof entityDefinitions.$inferSelect): EntityDefinition {
    return {
      name: r.name, label: r.label, description: r.description || undefined,
      fields: JSON.parse(r.fields || '[]'),
      public: r.publicConfig ? JSON.parse(r.publicConfig) : undefined,
    }
  }
}
