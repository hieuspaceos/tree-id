import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { SerializedEditorState } from 'lexical'
import { getPayloadClient, getSeedBySlug } from '@/lib/payload-helpers'
import { Breadcrumb } from '@/components/breadcrumb'
import { LexicalRenderer, extractHeadings } from '@/components/lexical-renderer'
import { Toc } from '@/components/toc'
import { generateSeedMetadata } from '@/lib/seo/generate-metadata'
import { articleJsonLd } from '@/lib/seo/json-ld'

/** Seed shape until payload-types.ts is generated */
interface SeedDoc {
  title: string
  description: string
  slug: string
  publishedAt?: string | null
  content?: unknown
  tags?: { tag: string }[] | null
  [key: string]: unknown
}

export const revalidate = 3600

interface SeedPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: SeedPageProps): Promise<Metadata> {
  const { slug } = await params
  const seed = (await getSeedBySlug('articles', slug) || await getSeedBySlug('notes', slug)) as unknown as SeedDoc | null
  if (!seed) return {}
  return generateSeedMetadata(seed)
}

export default async function SeedPage({ params }: SeedPageProps) {
  const { slug } = await params

  // Query both collections in parallel to avoid waterfall
  const [articleResult, noteResult] = await Promise.all([
    getSeedBySlug('articles', slug),
    getSeedBySlug('notes', slug),
  ])
  let seed = (articleResult as unknown as SeedDoc | null)
  let collection: 'articles' | 'notes' = 'articles'
  if (!seed) {
    seed = (noteResult as unknown as SeedDoc | null)
    collection = 'notes'
  }
  if (!seed) notFound()

  const isArticle = collection === 'articles'
  const content = seed.content as SerializedEditorState | string | null
  const headings = isArticle && content ? extractHeadings(content as SerializedEditorState) : []
  const date = seed.publishedAt
    ? new Date(seed.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : null

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(seed)) }} />
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: collection === 'articles' ? 'Articles' : 'Notes' },
          { label: seed.title },
        ]}
      />

      {/* Article header with glass panel */}
      <header className="glass-panel mb-10 rounded-2xl px-8 py-8">
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-slate-900">
          {seed.title}
        </h1>
        <p className="mb-4 text-lg leading-relaxed text-slate-500">
          {seed.description}
        </p>
        <div className="flex items-center gap-3 text-sm">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium ${
            isArticle
              ? 'bg-blue-500/8 text-blue-600 border border-blue-500/12'
              : 'bg-green-500/8 text-green-600 border border-green-500/12'
          }`}>
            {isArticle ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                <path d="M14 2v6h6" />
                <path d="M16 13H8" />
                <path d="M16 17H8" />
                <path d="M10 9H8" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            )}
            <span className="capitalize">{collection}</span>
          </span>
          {date && <time dateTime={seed.publishedAt!} className="text-slate-400">{date}</time>}
        </div>

        {/* Tags */}
        {seed.tags && seed.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {seed.tags.map(({ tag }) => (
              <span key={tag} className="glass-tag">{tag}</span>
            ))}
          </div>
        )}
      </header>

      {/* Content area */}
      <div className={headings.length > 0 ? 'lg:grid lg:grid-cols-[1fr_240px] lg:gap-10' : ''}>
        <div>
          {isArticle && content ? (
            <LexicalRenderer data={content as SerializedEditorState} />
          ) : (
            <div className="prose prose-slate max-w-none whitespace-pre-wrap">
              {typeof content === 'string' ? content : null}
            </div>
          )}
        </div>

        {headings.length > 0 && (
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <Toc headings={headings} />
            </div>
          </aside>
        )}
      </div>
    </article>
  )
}

export async function generateStaticParams() {
  try {
    const payload = await getPayloadClient()
    const [articles, notes] = await Promise.all([
      payload.find({ collection: 'articles', where: { status: { equals: 'published' } }, limit: 100 }),
      payload.find({ collection: 'notes', where: { status: { equals: 'published' } }, limit: 100 }),
    ])
    return [...articles.docs, ...notes.docs].map((doc) => ({ slug: (doc as unknown as SeedDoc).slug }))
  } catch {
    // DB unavailable at build time (first deploy) — render all pages on-demand
    return []
  }
}
