import Link from 'next/link'
import { siteConfig } from '@/config/site-config'

/** Main navigation bar with frosted glass effect */
export function Nav() {
  const socials = Object.entries(siteConfig.socialLinks).filter(([, url]) => url)

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-semibold tracking-tight text-slate-900 transition-opacity hover:opacity-70 cursor-pointer"
        >
          {/* Tree icon inline SVG */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
            <path d="M12 22V12" />
            <path d="M12 12L8 8" />
            <path d="M12 12L16 8" />
            <path d="M12 8L9 5" />
            <path d="M12 8L15 5" />
            <path d="M12 5L10 3" />
            <path d="M12 5L14 3" />
          </svg>
          {siteConfig.name}
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/search"
            className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-black/[0.04] hover:text-slate-900 cursor-pointer"
          >
            {/* Search icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21L16.65 16.65" />
            </svg>
            Search
          </Link>
          {socials.map(([platform, url]) => (
            <a
              key={platform}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-3 py-2 text-sm capitalize text-slate-500 transition-colors hover:bg-black/[0.04] hover:text-slate-900 cursor-pointer"
            >
              {platform}
            </a>
          ))}
        </div>
      </div>
    </nav>
  )
}
