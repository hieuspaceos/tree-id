/**
 * TursoContentIO — reads/writes content via Turso DB (production).
 * Replaces GitHubContentIO for paid tier. GitHubContentIO stays for free tier.
 */
import { eq, and } from 'drizzle-orm'
import { getDb } from '@/db/client'
import { contentEntries, siteSettings } from '@/db/schema-content'
import type { ContentIO, EntryMeta, EntryData } from './content-io-types'
import type { CollectionName } from './validation'

export class TursoContentIO implements ContentIO {
  private db: ReturnType<typeof getDb>

  constructor(db?: ReturnType<typeof getDb>) {
    this.db = db || getDb()
  }

  async listCollection(name: CollectionName): Promise<EntryMeta[]> {
    const rows = await this.db.select().from(contentEntries)
      .where(eq(contentEntries.collection, name))
    return rows.map(r => ({
      slug: r.slug, title: r.title, status: r.status,
      description: r.description || '',
      publishedAt: r.publishedAt,
      ...this.parseMeta(r.metadata),
    }))
  }

  async readEntry(collection: CollectionName, slug: string): Promise<EntryData | null> {
    const [row] = await this.db.select().from(contentEntries)
      .where(and(eq(contentEntries.collection, collection), eq(contentEntries.slug, slug)))
    if (!row) return null
    return {
      slug: row.slug, title: row.title, status: row.status,
      description: row.description || '',
      publishedAt: row.publishedAt,
      content: row.body || undefined,
      ...this.parseMeta(row.metadata),
    }
  }

  async writeEntry(collection: CollectionName, slug: string, data: EntryData): Promise<void> {
    const { title = '', status = 'draft', description = '', publishedAt, content, slug: _s, ...rest } = data
    const now = new Date().toISOString()
    await this.db.insert(contentEntries).values({
      id: crypto.randomUUID(), collection, slug, title, status,
      description, body: content || null,
      metadata: JSON.stringify(rest), publishedAt: publishedAt || null,
      createdAt: now, updatedAt: now,
    }).onConflictDoUpdate({
      target: [contentEntries.collection, contentEntries.slug],
      set: { title, status, description, body: content || null,
        metadata: JSON.stringify(rest), publishedAt: publishedAt || null, updatedAt: now },
    })
  }

  async deleteEntry(collection: CollectionName, slug: string): Promise<void> {
    await this.db.delete(contentEntries)
      .where(and(eq(contentEntries.collection, collection), eq(contentEntries.slug, slug)))
  }

  async readSingleton(name: string): Promise<Record<string, unknown> | null> {
    const [row] = await this.db.select().from(siteSettings).where(eq(siteSettings.key, name))
    if (!row) return null
    return JSON.parse(row.value)
  }

  async writeSingleton(name: string, data: Record<string, unknown>): Promise<void> {
    const val = JSON.stringify(data)
    await this.db.insert(siteSettings).values({ key: name, value: val, updatedAt: new Date().toISOString() })
      .onConflictDoUpdate({ target: siteSettings.key, set: { value: val, updatedAt: new Date().toISOString() } })
  }

  async listSlugs(collection: CollectionName): Promise<string[]> {
    const rows = await this.db.select({ slug: contentEntries.slug }).from(contentEntries)
      .where(eq(contentEntries.collection, collection))
    return rows.map(r => r.slug)
  }

  private parseMeta(json: string): Record<string, unknown> {
    try { return JSON.parse(json || '{}') } catch { return {} }
  }
}
