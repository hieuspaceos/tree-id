/**
 * Entity editor page — dynamic form based on entity definition fields.
 * New mode when no slug provided.
 */
import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { api } from '@/lib/admin/api-client'
import type { EntityDefinition, EntityFieldDef } from '@/lib/admin/entity-io'

interface Props { name: string; slug?: string }

const inputStyle = { width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }

function FieldInput({ field, value, onChange }: { field: EntityFieldDef; value: unknown; onChange: (v: unknown) => void }) {
  const val = value ?? (field.type === 'boolean' ? false : field.type === 'array' ? [] : '')

  if (field.type === 'textarea') {
    return <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' as const }}
      value={val as string} onChange={(e) => onChange(e.target.value)} />
  }
  if (field.type === 'boolean') {
    return <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
      <input type="checkbox" checked={val as boolean} onChange={(e) => onChange(e.target.checked)} />
      {field.label}
    </label>
  }
  if (field.type === 'select' && field.options) {
    return <select style={inputStyle} value={val as string} onChange={(e) => onChange(e.target.value)}>
      <option value="">— Select —</option>
      {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  }
  if (field.type === 'array') {
    const arr = (val as string[]) || []
    return (
      <div>
        {arr.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <input style={{ ...inputStyle, flex: 1 }} value={item}
              onChange={(e) => { const n = [...arr]; n[i] = e.target.value; onChange(n) }} />
            <button type="button" onClick={() => onChange(arr.filter((_, j) => j !== i))}
              style={{ padding: '4px 8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>×</button>
          </div>
        ))}
        <button type="button" onClick={() => onChange([...arr, ''])}
          style={{ fontSize: '0.75rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>+ Add</button>
      </div>
    )
  }
  if (field.type === 'number') {
    return <input type="number" style={inputStyle} value={val as number}
      onChange={(e) => onChange(e.target.valueAsNumber)} />
  }
  if (field.type === 'date') {
    return <input type="date" style={inputStyle} value={val as string}
      onChange={(e) => onChange(e.target.value)} />
  }
  return <input type="text" style={inputStyle} value={val as string}
    onChange={(e) => onChange(e.target.value)} />
}

export function EntityEditorPage({ name, slug }: Props) {
  const [, navigate] = useLocation()
  const [def, setDef] = useState<EntityDefinition | null>(null)
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const isNew = !slug

  useEffect(() => {
    const loadDef = api.entities.listDefinitions().then((res) => {
      const defs = (res.data as any)?.entries || []
      const found = defs.find((d: EntityDefinition) => d.name === name)
      setDef(found || null)
    })

    if (slug) {
      Promise.all([
        loadDef,
        api.entities.readInstance(name, slug).then((res) => {
          if (res.ok && res.data) setFormData(res.data as Record<string, unknown>)
        }),
      ]).finally(() => setLoading(false))
    } else {
      loadDef.finally(() => setLoading(false))
    }
  }, [name, slug])

  function setField(fieldName: string, value: unknown) {
    setFormData((prev) => ({ ...prev, [fieldName]: value }))
  }

  async function handleSave() {
    if (!def) return
    setSaving(true); setError('')
    const res = isNew
      ? await api.entities.createInstance(name, formData)
      : await api.entities.updateInstance(name, slug!, formData)
    setSaving(false)
    if (res.ok) {
      if (isNew) navigate(`/entities/${name}`)
      else { setError(''); /* stay on page */ }
    } else {
      setError(res.error || 'Save failed')
    }
  }

  if (loading) return <p style={{ color: '#94a3b8' }}>Loading...</p>
  if (!def) return <p style={{ color: '#dc2626' }}>Entity type "{name}" not found.</p>

  return (
    <div style={{ maxWidth: '600px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button className="admin-btn" onClick={() => navigate(`/entities/${name}`)} style={{ fontSize: '0.8rem' }}>← Back</button>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', flex: 1 }}>
          {isNew ? `New ${def.label}` : `Edit ${def.label}`}
        </h1>
        <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}

      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
        {def.fields.length === 0 && (
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No fields defined for this entity type.</p>
        )}
        {def.fields.map((field) => (
          <div key={field.name} style={{ marginBottom: '1rem' }}>
            {field.type !== 'boolean' && (
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                {field.label}{field.required && <span style={{ color: '#ef4444' }}> *</span>}
              </label>
            )}
            <FieldInput field={field} value={formData[field.name]} onChange={(v) => setField(field.name, v)} />
          </div>
        ))}
      </div>
    </div>
  )
}
