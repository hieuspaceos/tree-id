import { getPayload } from 'payload'
import config from '@payload-config'

/** Cached Payload client instance for server-side use */
export async function getPayloadClient() {
  return getPayload({ config })
}

/** Fetch published seeds from a collection, sorted by publishedAt desc */
export async function getPublishedSeeds(
  collection: 'articles' | 'notes',
  limit = 10,
  page = 1,
) {
  try {
    const payload = await getPayloadClient()
    return await payload.find({
      collection,
      where: { status: { equals: 'published' } },
      sort: '-publishedAt',
      limit,
      page,
    })
  } catch {
    // Tables may not exist yet on first deploy (push mode creates them async)
    return { docs: [], totalDocs: 0, totalPages: 0, page: 1, limit, hasNextPage: false, hasPrevPage: false, pagingCounter: 1, nextPage: null, prevPage: null }
  }
}

/** Get the active theme id from site-settings global (falls back to site-config) */
export async function getActiveThemeId(): Promise<string> {
  try {
    const payload = await getPayloadClient()
    const settings = await payload.findGlobal({ slug: 'site-settings' as 'site-settings' })
    return (settings as { themeId?: string }).themeId || 'liquid-glass'
  } catch {
    return 'liquid-glass'
  }
}

/** Find a single seed by slug, returns null if not found */
export async function getSeedBySlug(
  collection: 'articles' | 'notes',
  slug: string,
) {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection,
      where: {
        and: [
          { slug: { equals: slug } },
          { status: { equals: 'published' } },
        ],
      },
      limit: 1,
    })
    return result.docs[0] || null
  } catch {
    return null
  }
}
