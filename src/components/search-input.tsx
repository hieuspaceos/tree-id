'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'

interface SearchResult {
  id: string
  title: string
  slug: string
  collection?: string
}

/** Debounced search input with glass morphism styling */
export function SearchInput() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?where[title][contains]=${encodeURIComponent(q)}&limit=20`)
      const data = await res.json()
      setResults(
        (data.docs || []).map((doc: Record<string, unknown>) => ({
          id: doc.id as string,
          title: (doc.title as string) || 'Untitled',
          slug: (doc.slug as string) || '',
          collection: (doc.relationTo as string) || '',
        })),
      )
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => search(query), 300)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [query, search])

  return (
    <div>
      {/* Glass search input */}
      <div className="relative">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21L16.65 16.65" />
        </svg>
        <input
          type="search"
          placeholder="Search seeds..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="glass-input w-full rounded-2xl py-4 pl-12 pr-4 text-base text-slate-900 placeholder:text-slate-400"
          autoFocus
        />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          Searching...
        </div>
      )}

      {/* Empty state */}
      {!loading && query.length >= 2 && results.length === 0 && (
        <div className="glass-panel mt-6 rounded-2xl px-6 py-8 text-center">
          <p className="text-sm text-slate-400">No results found for &ldquo;{query}&rdquo;</p>
        </div>
      )}

      {/* Results list */}
      {results.length > 0 && (
        <ul className="mt-5 space-y-3">
          {results.map((r) => (
            <li key={r.id}>
              <Link
                href={`/seeds/${r.slug}`}
                className="glass-card flex cursor-pointer items-center justify-between px-5 py-4"
              >
                <span className="font-medium text-slate-900">{r.title}</span>
                {r.collection && (
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    r.collection === 'articles'
                      ? 'bg-blue-500/8 text-blue-600'
                      : 'bg-green-500/8 text-green-600'
                  }`}>
                    {r.collection}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
