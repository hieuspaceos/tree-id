/**
 * TursoDistributionIO — distribution logs via Turso DB.
 */
import { getDb } from '@/db/client'
import { distributionLogs } from '@/db/schema-content'
import type { DistributionIO, DistributionEntry } from './distribution-io-types'

export class TursoDistributionIO implements DistributionIO {
  private db: ReturnType<typeof getDb>
  constructor(db?: ReturnType<typeof getDb>) { this.db = db || getDb() }

  async parseLog(): Promise<DistributionEntry[]> {
    const rows = await this.db.select().from(distributionLogs)
    return rows.map(r => ({
      date: r.distributedAt || '',
      slug: r.slug,
      type: r.contentType,
      platforms: JSON.parse(r.platforms || '[]'),
      status: r.status as 'drafted' | 'posted',
      wordCount: r.wordCount || 0,
      notes: r.notes || '',
    }))
  }

  async appendEntry(entry: DistributionEntry): Promise<void> {
    await this.db.insert(distributionLogs).values({
      id: crypto.randomUUID(),
      slug: entry.slug,
      contentType: entry.type,
      platforms: JSON.stringify(entry.platforms),
      status: entry.status,
      wordCount: entry.wordCount,
      notes: entry.notes,
      distributedAt: entry.date || new Date().toISOString(),
    })
  }
}
