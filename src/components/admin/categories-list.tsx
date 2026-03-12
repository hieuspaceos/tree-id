/**
 * Categories list — admin table with name, color swatch, description, edit/delete
 */
import { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { api } from '@/lib/admin/api-client'
import { useToast } from './admin-toast'

interface CategoryEntry {
  slug: string
  title: string
  name?: string
  description: string
  color?: string
  [key: string]: unknown
}

export function CategoriesList() {
  const [, navigate] = useLocation()
  const [entries, setEntries] = useState<CategoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    api.collections.list('categories').then((res) => {
      if (res.ok && res.data) {
        setEntries(res.data.entries as unknown as CategoryEntry[])
      }
      setLoading(false)
    })
  }, [])

  const [confirmSlug, setConfirmSlug] = useState<string | null>(null)

  async function handleDelete(slug: string) {
    if (confirmSlug !== slug) { setConfirmSlug(slug); return }
    setConfirmSlug(null)
    const res = await api.collections.delete('categories', slug)
    if (res.ok) {
      setEntries((prev) => prev.filter((e) => e.slug !== slug))
      toast.success('Deleted')
    } else {
      toast.error('Delete failed')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Categories</h1>
        <button className="admin-btn admin-btn-primary" onClick={() => navigate('/categories/new')}>
          + New Category
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '1rem', borderRadius: '14px' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
        ) : entries.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
            <p>No categories yet</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Create categories to organize your content</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Color</th>
                <th>Name</th>
                <th>Description</th>
                <th style={{ width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.slug}>
                  <td style={{ width: '50px' }}>
                    <span
                      className="color-swatch"
                      style={{ backgroundColor: entry.color || '#94a3b8' }}
                    />
                  </td>
                  <td>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); navigate(`/categories/${entry.slug}`) }}
                      style={{ color: '#1e293b', fontWeight: 600, textDecoration: 'none' }}
                    >
                      {entry.title || entry.name || entry.slug}
                    </a>
                  </td>
                  <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    {entry.description || '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button
                        className="admin-btn admin-btn-ghost"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => navigate(`/categories/${entry.slug}`)}
                      >
                        Edit
                      </button>
                      <button
                        className={`admin-btn ${confirmSlug === entry.slug ? 'admin-btn-danger' : 'admin-btn-ghost'}`}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => handleDelete(entry.slug)}
                        onBlur={() => { if (confirmSlug === entry.slug) setConfirmSlug(null) }}
                      >
                        {confirmSlug === entry.slug ? 'Confirm?' : 'Del'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
