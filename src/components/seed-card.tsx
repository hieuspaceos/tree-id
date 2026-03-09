import Link from 'next/link'

interface SeedCardProps {
  title: string
  description: string
  slug: string
  publishedAt: string | null
  tags: { tag: string }[]
  collection: 'articles' | 'notes'
}

/** Card component displaying a seed (article/note) summary */
export function SeedCard({ title, description, slug, publishedAt, tags, collection }: SeedCardProps) {
  const date = publishedAt ? new Date(publishedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  }) : null

  return (
    <Link
      href={`/seeds/${slug}`}
      className="block rounded-lg border border-gray-200 p-5 transition-colors hover:border-gray-400 hover:bg-gray-50"
    >
      <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
        <span className="capitalize">{collection}</span>
        {date && <><span>·</span><time dateTime={publishedAt!}>{date}</time></>}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mb-3 line-clamp-2 text-sm text-gray-600">{description}</p>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map(({ tag }) => (
            <span key={tag} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}
