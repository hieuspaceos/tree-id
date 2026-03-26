/**
 * Landing pages list — grid of cards with create button
 */
import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { api } from '@/lib/admin/api-client'

interface PageMeta {
  slug: string
  title: string
  template?: string
  sectionCount: number
}

export function LandingPagesList() {
  const [, navigate] = useLocation()
  const [pages, setPages] = useState<PageMeta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.landing.list().then((res) => {
      setPages((res.data as any)?.entries || [])
      setLoading(false)
    })
  }, [])

  async function handleDelete(slug: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return
    const res = await api.landing.delete(slug)
    if (res.ok) setPages((prev) => prev.filter((p) => p.slug !== slug))
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Landing Pages</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="admin-btn" onClick={() => navigate('/landing/wizard')}>
            AI Wizard
          </button>
          <button className="admin-btn admin-btn-primary" onClick={() => navigate('/landing/new')}>
            + New Page
          </button>
        </div>
      </div>

      {loading && <p style={{ color: '#94a3b8' }}>Loading...</p>}

      {!loading && pages.length === 0 && (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '14px' }}>
          <p style={{ color: '#64748b', marginBottom: '1rem' }}>No landing pages yet.</p>
          <button className="admin-btn admin-btn-primary" onClick={() => navigate('/landing/new')}>
            Create your first page
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {pages.map((page) => (
          <div key={page.slug} className="glass-card" style={{ padding: '1.25rem', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <h3 style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>{page.title}</h3>
              <span style={{ fontSize: '0.7rem', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '99px' }}>
                {page.sectionCount} sections
              </span>
            </div>
            {page.template && (
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                Template: {page.template}
              </p>
            )}
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem', fontFamily: 'monospace' }}>
              /{page.slug}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="admin-btn admin-btn-primary" style={{ flex: 1, fontSize: '0.8rem' }}
                onClick={() => navigate(`/landing/${page.slug}`)}>
                Edit
              </button>
              <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer"
                className="admin-btn" style={{ fontSize: '0.8rem' }}>
                Preview
              </a>
              <button className="admin-btn" style={{ fontSize: '0.8rem', color: '#ef4444' }}
                onClick={() => handleDelete(page.slug, page.title)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
