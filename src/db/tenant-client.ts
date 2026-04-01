/**
 * Per-tenant Drizzle connection factory with LRU cache (max 100 entries).
 * Each SaaS user has their own isolated Turso DB; this module caches
 * connections so repeated requests reuse the same client instance.
 * Never import this in client components — server-side only.
 */
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as contentSchema from './schema-content'

const MAX_CACHE = 100

/** LRU cache: key = `${url}::${token}`, value = drizzle instance */
const cache = new Map<string, ReturnType<typeof drizzle<typeof contentSchema>>>()

/** Evict the oldest (first-inserted) entry from the cache */
function evictOldest(): void {
  const firstKey = cache.keys().next().value
  if (firstKey !== undefined) cache.delete(firstKey)
}

/**
 * Get a Drizzle DB instance for a tenant database.
 * Returns a cached instance if one exists; otherwise creates and caches a new one.
 *
 * @param url   - libsql connection URL for the tenant DB (e.g. libsql://tt-xxxx.turso.io)
 * @param token - Auth token for the tenant DB
 */
export function getTenantDb(
  url: string,
  token: string,
): ReturnType<typeof drizzle<typeof contentSchema>> {
  const key = `${url}::${token}`

  const existing = cache.get(key)
  if (existing) {
    // Refresh insertion order (move to end = most recently used)
    cache.delete(key)
    cache.set(key, existing)
    return existing
  }

  if (cache.size >= MAX_CACHE) evictOldest()

  const client = createClient({ url, authToken: token })
  const db = drizzle(client, { schema: contentSchema })
  cache.set(key, db)
  return db
}

/** Exposed for testing — clears all cached connections */
export function clearTenantDbCache(): void {
  cache.clear()
}
