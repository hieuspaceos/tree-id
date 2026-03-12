// Content collection query helpers — replaces payload-helpers.ts
// Uses Astro's getCollection API (astro:content) for type-safe, filter-aware queries
import { getCollection, getEntry } from 'astro:content'

/** Get all published entries from a single collection, sorted by publishedAt desc */
export async function getPublishedSeeds(collectionName: 'articles' | 'notes') {
  const entries = await getCollection(collectionName)
  return entries
    .filter((e) => e.data.status === 'published')
    .sort((a, b) => {
      const dateA = a.data.publishedAt ? new Date(a.data.publishedAt).getTime() : 0
      const dateB = b.data.publishedAt ? new Date(b.data.publishedAt).getTime() : 0
      return dateB - dateA
    })
}

/** Merge articles + notes, tagged with collection name, sorted by publishedAt desc */
export async function getAllPublishedSeeds() {
  const [articles, notes] = await Promise.all([
    getPublishedSeeds('articles'),
    getPublishedSeeds('notes'),
  ])

  const tagged = [
    ...articles.map((e) => ({ ...e, collection: 'articles' as const })),
    ...notes.map((e) => ({ ...e, collection: 'notes' as const })),
  ]

  return tagged.sort((a, b) => {
    const dateA = a.data.publishedAt ? new Date(a.data.publishedAt).getTime() : 0
    const dateB = b.data.publishedAt ? new Date(b.data.publishedAt).getTime() : 0
    return dateB - dateA
  })
}

/** Get all categories */
export async function getAllCategories() {
  return getCollection('categories')
}

/** Get a single category by slug */
export async function getCategoryBySlug(slug: string) {
  return getEntry('categories', slug)
}

/** Get all published seeds filtered by category slug */
export async function getSeedsByCategory(categorySlug: string) {
  const seeds = await getAllPublishedSeeds()
  return seeds.filter((s) => s.data.category === categorySlug)
}
