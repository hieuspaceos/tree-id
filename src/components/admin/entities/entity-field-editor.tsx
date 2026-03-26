/**
 * Entity field schema editor — inline editor for adding/editing/removing fields on an entity definition.
 * Each existing field is directly editable inline (label, type, required).
 */
import { useState } from 'react'
import type { EntityFieldDef } from '@/lib/admin/entity-io'

const FIELD_TYPES: EntityFieldDef['type'][] = ['text', 'textarea', 'number', 'boolean', 'select', 'date', 'array']

const inputStyle: React.CSSProperties = {
  padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem', width: '100%',
}

interface Props {
  fields: EntityFieldDef[]
  onChange: (fields: EntityFieldDef[]) => void
}

export function EntityFieldEditor({ fields, onChange }: Props) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState<EntityFieldDef>({ name: '', type: 'text', label: '', required: false })

  function updateField(idx: number, patch: Partial<EntityFieldDef>) {
    const next = fields.map((f, i) => i === idx ? { ...f, ...patch } : f)
    onChange(next)
  }

  function addField() {
    if (!draft.label) return
    const name = draft.name || draft.label.toLowerCase().replace(/\s+/g, '_')
    onChange([...fields, { ...draft, name }])
    setDraft({ name: '', type: 'text', label: '', required: false })
    setAdding(false)
  }

  function removeField(idx: number) {
    onChange(fields.filter((_, i) => i !== idx))
  }

  function moveField(idx: number, dir: -1 | 1) {
    const next = [...fields]
    const target = idx + dir
    if (target < 0 || target >= next.length) return
    ;[next[idx], next[target]] = [next[target], next[idx]]
    onChange(next)
  }

  return (
    <div>
      {/* Header */}
      {fields.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 70px 50px 80px', gap: '0.4rem', padding: '0 0 0.3rem', marginBottom: '0.25rem', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Label / Name</span>
          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Type</span>
          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Req</span>
          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Order</span>
          <span />
        </div>
      )}

      {/* Editable field rows */}
      {fields.map((f, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 70px 50px 80px', gap: '0.4rem', alignItems: 'center', padding: '0.3rem 0', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
          {/* Label + name */}
          <div>
            <input
              style={{ ...inputStyle, fontWeight: 600, marginBottom: '2px' }}
              value={f.label}
              onChange={e => updateField(i, { label: e.target.value })}
              placeholder="Label"
            />
            <input
              style={{ ...inputStyle, fontSize: '0.7rem', color: '#94a3b8' }}
              value={f.name}
              onChange={e => updateField(i, { name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
              placeholder="field_name"
            />
          </div>
          {/* Type */}
          <select style={inputStyle} value={f.type} onChange={e => updateField(i, { type: e.target.value as EntityFieldDef['type'] })}>
            {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {/* Required */}
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <input type="checkbox" checked={f.required || false} onChange={e => updateField(i, { required: e.target.checked })} />
          </label>
          {/* Move */}
          <div style={{ display: 'flex', gap: '2px' }}>
            <button onClick={() => moveField(i, -1)} className="admin-btn admin-btn-ghost" style={{ padding: '2px 5px', fontSize: '0.65rem' }} disabled={i === 0}>↑</button>
            <button onClick={() => moveField(i, 1)} className="admin-btn admin-btn-ghost" style={{ padding: '2px 5px', fontSize: '0.65rem' }} disabled={i === fields.length - 1}>↓</button>
          </div>
          {/* Remove */}
          <button onClick={() => removeField(i)} className="admin-btn admin-btn-ghost" style={{ padding: '2px 6px', fontSize: '0.7rem', color: '#dc2626' }}>Remove</button>
        </div>
      ))}

      {/* Add field form */}
      {adding ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 70px auto', gap: '0.4rem', alignItems: 'end', marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(0,0,0,0.02)', borderRadius: '8px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', marginBottom: '2px' }}>Label</label>
            <input style={inputStyle} placeholder="e.g. Email" value={draft.label}
              onChange={e => setDraft({ ...draft, label: e.target.value, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', marginBottom: '2px' }}>Type</label>
            <select style={inputStyle} value={draft.type} onChange={e => setDraft({ ...draft, type: e.target.value as EntityFieldDef['type'] })}>
              {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#64748b', cursor: 'pointer' }}>
            <input type="checkbox" checked={draft.required || false} onChange={e => setDraft({ ...draft, required: e.target.checked })} />
            Req
          </label>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button className="admin-btn admin-btn-primary" style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={addField}>Add</button>
            <button className="admin-btn" style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <button className="admin-btn admin-btn-ghost" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }} onClick={() => setAdding(true)}>
          + Add Field
        </button>
      )}
    </div>
  )
}
