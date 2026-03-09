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
  const payload = await getPayloadClient()
  return payload.find({
    collection,
    where: { status: { equals: 'published' } },
    sort: '-publishedAt',
    limit,
    page,
  })
}

/** Find a single seed by slug, returns null if not found */
export async function getSeedBySlug(
  collection: 'articles' | 'notes',
  slug: string,
) {
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
}
