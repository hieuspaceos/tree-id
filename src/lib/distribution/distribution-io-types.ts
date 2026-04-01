/**
 * Distribution IO types — interface for content distribution log storage.
 */

export interface DistributionEntry {
  date: string
  slug: string
  type: string
  platforms: string[]
  status: 'drafted' | 'posted'
  wordCount: number
  notes: string
}

export interface DistributionStats {
  total: number
  posted: number
  drafted: number
  platformCounts: Record<string, number>
  firstDate: string | null
  lastDate: string | null
  avgPerWeek: number
}

export interface ContentItem {
  title: string
  slug: string
  collection: 'articles' | 'notes'
  publishedAt: string | null
  distributedPlatforms: string[]
  distributionStatus: 'not_distributed' | 'drafted' | 'posted'
  distributionDate: string | null
}

export interface DistributionIO {
  parseLog(): Promise<DistributionEntry[]>
  appendEntry(entry: DistributionEntry): Promise<void>
}
