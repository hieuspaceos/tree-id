/**
 * Distribution stats — pure functions for aggregating distribution data.
 * No IO — takes parsed entries as input, returns computed stats.
 */
import type { DistributionEntry, DistributionStats, ContentItem } from './distribution-io-types'

/** Compute aggregate stats from parsed entries */
export function getDistributionStats(entries: DistributionEntry[]): DistributionStats {
  if (entries.length === 0) {
    return { total: 0, posted: 0, drafted: 0, platformCounts: {}, firstDate: null, lastDate: null, avgPerWeek: 0 }
  }

  const posted = entries.filter(e => e.status === 'posted').length
  const drafted = entries.filter(e => e.status === 'drafted').length

  const platformCounts: Record<string, number> = {}
  for (const entry of entries) {
    for (const p of entry.platforms) {
      platformCounts[p] = (platformCounts[p] ?? 0) + 1
    }
  }

  const dates = entries.map(e => e.date).filter(Boolean).sort()
  const firstDate = dates[0] ?? null
  const lastDate = dates[dates.length - 1] ?? null

  let avgPerWeek = entries.length
  if (firstDate && lastDate) {
    const diffMs = new Date(lastDate).getTime() - new Date(firstDate).getTime()
    const weeks = Math.max(1, diffMs / (7 * 24 * 60 * 60 * 1000))
    avgPerWeek = Math.round((entries.length / weeks) * 10) / 10
  }

  return { total: entries.length, posted, drafted, platformCounts, firstDate, lastDate, avgPerWeek }
}

/** Build content inventory by cross-referencing content with distribution log */
export function buildContentInventory(
  seeds: Array<{ data: { title: string; publishedAt?: string | null }; id: string; collection: 'articles' | 'notes' }>,
  entries: DistributionEntry[],
): ContentItem[] {
  const entryMap = new Map<string, DistributionEntry>()
  for (const e of entries) entryMap.set(e.slug, e)

  return seeds.map(seed => {
    const entry = entryMap.get(seed.id)
    return {
      title: seed.data.title, slug: seed.id, collection: seed.collection,
      publishedAt: seed.data.publishedAt ?? null,
      distributedPlatforms: entry?.platforms ?? [],
      distributionStatus: entry ? entry.status : 'not_distributed',
      distributionDate: entry?.date ?? null,
    }
  })
}
