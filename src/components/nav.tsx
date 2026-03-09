import Link from 'next/link'
import { siteConfig } from '@/config/site-config'

/** Main navigation bar with site name and social links */
export function Nav() {
  const socials = Object.entries(siteConfig.socialLinks).filter(([, url]) => url)

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>
          {siteConfig.name}
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/search" className="text-sm text-gray-600 hover:text-gray-900">
            Search
          </Link>
          {socials.map(([platform, url]) => (
            <a
              key={platform}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm capitalize text-gray-500 hover:text-gray-900"
            >
              {platform}
            </a>
          ))}
        </div>
      </div>
    </nav>
  )
}
