import Link from 'next/link'

interface SeedCardProps {
  title: string
  description: string
  slug: string
  publishedAt: string | null
  tags: { tag: string }[]
  collection: 'articles' | 'notes'
}

/** Glass-morphism card displaying a seed (article/note) summary */
export function SeedCard({ title, description, slug, publishedAt, tags, collection }: SeedCardProps) {
  const date = publishedAt ? new Date(publishedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  }) : null

  const isArticle = collection === 'articles'

  return (
    <Link
      href={`/seeds/${slug}`}
      className="glass-card block cursor-pointer p-6"
    >
      {/* Collection badge + date */}
      <div className="mb-3 flex items-center gap-2 text-xs">
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium ${
          isArticle
            ? 'bg-blue-500/8 text-blue-600 border border-blue-500/12'
            : 'bg-green-500/8 text-green-600 border border-green-500/12'
        }`}>
          {/* Document/note icon */}
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
        {date && (
          <time dateTime={publishedAt!} className="text-slate-400">
            {date}
          </time>
        )}
      </div>

      {/* Title */}
      <h3 className="mb-2 text-lg font-semibold leading-snug text-slate-900">
        {title}
      </h3>

      {/* Description */}
      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-slate-500">
        {description}
      </p>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map(({ tag }) => (
            <span key={tag} className="glass-tag">
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}
