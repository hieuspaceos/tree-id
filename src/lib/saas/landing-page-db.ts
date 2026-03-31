/**
 * Turso-backed CRUD for SaaS user landing pages.
 * All queries scoped by userId from Better Auth session.
 * Owner YAML pages (ck2, ck3, home) handled separately by landing-config-reader.
 */
import { eq, and } from 'drizzle-orm'
import { getDb } from '@/db/client'
import { landingPages } from '@/db/schema'
import type { LandingPageConfig } from '@/lib/landing/landing-types'

/** Slugs reserved for existing routes and owner YAML pages */
const RESERVED_SLUGS = [
  'admin', 'api', 'auth', 'articles', 'seeds', 'notes', 'about',
  '404', 'keystatic', 'dashboard', 'checkout', 'search', 'marketplace',
  'categories', 'hs-admin', 'e', 'home', 'ck2', 'ck3', 'toi-ban-hoa',
]

function generateId(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 16)
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug)
}

export async function listUserPages(userId: string) {
  const db = getDb()
  return db.select().from(landingPages).where(eq(landingPages.userId, userId))
}

export async function getUserPage(userId: string, slug: string) {
  const db = getDb()
  const [page] = await db.select().from(landingPages)
    .where(and(eq(landingPages.userId, userId), eq(landingPages.slug, slug)))
  return page ?? null
}

export async function getPageBySlug(slug: string) {
  const db = getDb()
  const [page] = await db.select().from(landingPages)
    .where(eq(landingPages.slug, slug))
  return page ?? null
}

export async function createPage(
  userId: string,
  slug: string,
  name: string,
  config: LandingPageConfig,
) {
  const db = getDb()
  const id = generateId()
  await db.insert(landingPages).values({
    id, userId, slug, name,
    config: JSON.stringify(config),
    published: false,
  })
  return { id, slug }
}

export async function updatePage(
  userId: string,
  slug: string,
  data: { name?: string; config?: LandingPageConfig; published?: boolean },
) {
  const db = getDb()
  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() }
  if (data.name) updates.name = data.name
  if (data.config) updates.config = JSON.stringify(data.config)
  if (data.published !== undefined) updates.published = data.published

  const result = await db.update(landingPages).set(updates)
    .where(and(eq(landingPages.userId, userId), eq(landingPages.slug, slug)))
  return result.rowsAffected > 0
}

export async function deletePage(userId: string, slug: string) {
  const db = getDb()
  const result = await db.delete(landingPages)
    .where(and(eq(landingPages.userId, userId), eq(landingPages.slug, slug)))
  return result.rowsAffected > 0
}

export async function countUserPages(userId: string): Promise<number> {
  const db = getDb()
  const rows = await db.select().from(landingPages).where(eq(landingPages.userId, userId))
  return rows.length
}

export async function isSlugTaken(slug: string): Promise<boolean> {
  if (isReservedSlug(slug)) return true
  const page = await getPageBySlug(slug)
  return page !== null
}
