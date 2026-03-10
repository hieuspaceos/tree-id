'use client'

import { useEffect, useRef, useState } from 'react'
import type { TocHeading } from '@/components/lexical-renderer'

/** Glass-styled Table of Contents with scroll-spy */
export function Toc({ headings }: { headings: TocHeading[] }) {
  const [activeId, setActiveId] = useState<string>('')
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (headings.length === 0) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 },
    )

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[]

    for (const el of elements) {
      observerRef.current.observe(el)
    }

    return () => observerRef.current?.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav aria-label="Table of contents" className="glass-panel rounded-2xl p-5 text-sm">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        On this page
      </h4>
      <ul className="space-y-0.5">
        {headings.map((heading) => (
          <li key={heading.id} style={{ paddingLeft: `${Math.max(0, heading.level - 2) * 12}px` }}>
            <a
              href={`#${heading.id}`}
              className={`block rounded-lg px-2.5 py-1.5 transition-all duration-200 cursor-pointer ${
                activeId === heading.id
                  ? 'bg-blue-500/8 font-medium text-blue-600'
                  : 'text-slate-500 hover:bg-black/[0.03] hover:text-slate-800'
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
