/**
 * Entity list page — list instances of a given entity type
 */
import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { api } from '@/lib/admin/api-client'
import type { EntityInstance } from '@/lib/admin/entity-io'

interface Props { name: string }

export function EntityListPage({ name }: Props) {
  const [, navigate] = useLocation()
  const [instances, setInstances] = useState<EntityInstance[]>([])
  const [loading, setLoading] = useState(true)
  const [label, setLabel] = useState(name)

  useEffect(() => {
    // Load definition for label
    api.entities.listDefinitions().then((res) => {
      const defs = (res.data as any)?.entries || []
      const def = defs.find((d: any) => d.name === name)
      if (def) setLabel(def.label)
    })
    api.entities.listInstances(name).then((res) => {
      setInstances((res.data as any)?.entries || [])
      setLoading(false)
    })
  }, [name])

  async function handleDelete(slug: string) {
    if (!confirm(`Delete entry "${slug}"?`)) return
    const res = await api.entities.deleteInstance(name, slug)
    if (res.ok) setInstances((prev) => prev.filter((i) => i.slug !== slug))
  }

  /** Pick a display title from common field names */
  function getDisplayTitle(instance: EntityInstance): string {
    return (instance.title || instance.name || instance.label || instance.slug) as string
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button className="admin-btn" onClick={() => navigate('/entities')} style={{ fontSize: '0.8rem' }}>← Types</button>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', flex: 1 }}>{label}</h1>
        <button className="admin-btn admin-btn-primary" onClick={() => navigate(`/entities/${name}/new`)}>
          + New Entry
        </button>
      </div>

      {loading && <p style={{ color: '#94a3b8' }}>Loading...</p>}

      {!loading && instances.length === 0 && (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '14px' }}>
          <p style={{ color: '#64748b', marginBottom: '1rem' }}>No entries yet.</p>
          <button className="admin-btn admin-btn-primary" onClick={() => navigate(`/entities/${name}/new`)}>
            Create first entry
          </button>
        </div>
      )}

      {instances.length > 0 && (
        <div className="glass-panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#475569', fontWeight: 600 }}>Title / Name</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#475569', fontWeight: 600 }}>Slug</th>
                <th style={{ padding: '0.75rem 1rem', width: '120px' }}></th>
              </tr>
            </thead>
            <tbody>
              {instances.map((inst) => (
                <tr key={inst.slug} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '0.75rem 1rem', color: '#1e293b' }}>{getDisplayTitle(inst)}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.8rem' }}>{inst.slug}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="admin-btn" style={{ fontSize: '0.75rem' }}
                        onClick={() => navigate(`/entities/${name}/${inst.slug}`)}>Edit</button>
                      <button className="admin-btn" style={{ fontSize: '0.75rem', color: '#ef4444' }}
                        onClick={() => handleDelete(inst.slug)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
