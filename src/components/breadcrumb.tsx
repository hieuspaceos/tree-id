import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
}

/** Glass-styled breadcrumb navigation */
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm">
      <ol className="flex items-center gap-1.5 text-slate-400">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
                <path d="M9 18l6-6-6-6" />
              </svg>
            )}
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-slate-700 cursor-pointer">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-slate-600">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
