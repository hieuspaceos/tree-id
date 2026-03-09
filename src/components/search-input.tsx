'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'

interface SearchResult {
  id: string
  title: string
  slug: string
  collection?: string
}

/** Debounced search input that queries Payload search API */
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
      <input
        type="search"
        placeholder="Search seeds..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        autoFocus
      />

      {loading && <p className="mt-4 text-sm text-gray-500">Searching...</p>}

      {!loading && query && results.length === 0 && (
        <p className="mt-4 text-sm text-gray-500">No results found.</p>
      )}

      {results.length > 0 && (
        <ul className="mt-4 space-y-2">
          {results.map((r) => (
            <li key={r.id}>
              <Link
                href={`/seeds/${r.slug}`}
                className="block rounded-lg border border-gray-200 px-4 py-3 transition-colors hover:bg-gray-50"
              >
                <span className="font-medium text-gray-900">{r.title}</span>
                {r.collection && (
                  <span className="ml-2 text-xs capitalize text-gray-500">{r.collection}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
