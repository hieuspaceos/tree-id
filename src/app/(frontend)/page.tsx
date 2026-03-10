import { getPublishedSeeds } from '@/lib/payload-helpers'
import { SeedCard } from '@/components/seed-card'
import { siteConfig } from '@/config/site-config'
import { generateHomeMetadata } from '@/lib/seo/generate-metadata'
import { websiteJsonLd } from '@/lib/seo/json-ld'

export function generateMetadata() {
  return generateHomeMetadata()
}

/** Base seed shape until payload-types.ts is generated */
interface SeedDoc {
  id: string | number
  title: string
  description: string
  slug: string
  publishedAt?: string | null
  tags?: { tag: string }[] | null
  [key: string]: unknown
}

export const revalidate = 3600

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [articles, notes] = await Promise.all([
    getPublishedSeeds('articles', 6),
    getPublishedSeeds('notes', 6),
  ])

  // Merge and sort by publishedAt descending
  const seeds = [
    ...(articles.docs as SeedDoc[]).map((doc) => ({ ...doc, collection: 'articles' as const })),
    ...(notes.docs as SeedDoc[]).map((doc) => ({ ...doc, collection: 'notes' as const })),
  ].sort((a, b) => {
    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
    return dateB - dateA
  })

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }} />

      {/* Hero section with glass panel */}
      <section className="glass-panel mb-10 rounded-2xl px-8 py-10">
        <div className="flex items-start gap-4">
          {/* Tree icon */}
          <div className="hidden shrink-0 rounded-2xl bg-green-500/10 p-3 sm:block">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
              <path d="M12 22V12" />
              <path d="M12 12L8 8" />
              <path d="M12 12L16 8" />
              <path d="M12 8L9 5" />
              <path d="M12 8L15 5" />
              <path d="M12 5L10 3" />
              <path d="M12 5L14 3" />
            </svg>
          </div>
          <div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">
              {siteConfig.name}
            </h1>
            <p className="text-lg leading-relaxed text-slate-500">
              {siteConfig.description}
            </p>
          </div>
        </div>
      </section>

      {/* Seeds grid */}
      {seeds.length === 0 ? (
        <div className="glass-panel rounded-2xl px-8 py-12 text-center">
          <p className="text-slate-400">No published seeds yet.</p>
        </div>
      ) : (
        <section>
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Recent Seeds
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {seeds.map((seed) => (
              <SeedCard
                key={seed.slug}
                title={seed.title}
                description={seed.description}
                slug={seed.slug}
                publishedAt={seed.publishedAt ?? null}
                tags={(seed.tags as { tag: string }[] | null) ?? []}
                collection={seed.collection}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
