/**
 * Content I/O types, interfaces, and shared helpers
 * Used by both LocalContentIO and GitHubContentIO implementations
 */
import type { CollectionName } from './validation'

// ── Types ──

export interface EntryMeta {
  slug: string
  title: string
  status: string
  description: string
  publishedAt?: string | null
  tags?: string[]
  category?: string | null
  seoScore?: number | null
}

export interface EntryData extends EntryMeta {
  [key: string]: unknown
  content?: string // Markdown body for articles
}

export interface ContentIO {
  listCollection(name: CollectionName): Promise<EntryMeta[]>
  readEntry(collection: CollectionName, slug: string): Promise<EntryData | null>
  writeEntry(collection: CollectionName, slug: string, data: EntryData): Promise<void>
  deleteEntry(collection: CollectionName, slug: string): Promise<void>
  readSingleton(name: string): Promise<Record<string, unknown> | null>
  writeSingleton(name: string, data: Record<string, unknown>): Promise<void>
  listSlugs(collection: CollectionName): Promise<string[]>
}

// ── Path helpers (used by GitHubContentIO which doesn't have instance basePath) ──

/** Content base directory (relative to project root) */
export const CONTENT_BASE = 'src/content'

export function articlePath(slug: string): string {
  return `${CONTENT_BASE}/articles/${slug}/index.mdoc`
}

export function articleDir(slug: string): string {
  return `${CONTENT_BASE}/articles/${slug}`
}

export function yamlPath(collection: CollectionName, slug: string): string {
  return `${CONTENT_BASE}/${collection}/${slug}.yaml`
}

export function singletonPath(name: string): string {
  return `${CONTENT_BASE}/${name}.yaml`
}

export function isArticle(collection: CollectionName): boolean {
  return collection === 'articles'
}

/** Extract EntryMeta fields from a full EntryData */
export function pickMeta(entry: EntryData): EntryMeta {
  return {
    slug: entry.slug,
    title: entry.title,
    status: entry.status || 'draft',
    description: entry.description || '',
    publishedAt: entry.publishedAt as string | undefined,
    tags: entry.tags as string[] | undefined,
    category: entry.category as string | undefined,
    seoScore: (entry.seoScore as number) ?? null,
  }
}
