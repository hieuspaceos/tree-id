/**
 * Array of text items — add/remove buttons, no drag reorder (MVP)
 */
import { useState } from 'react'
import type { FieldProps } from './field-props'

export function ArrayField({ name, label, value, onChange, disabled }: FieldProps) {
  const items = (value as unknown[]) || []
  const [draft, setDraft] = useState('')

  /** Display an item — stringify objects, show strings as-is */
  function displayItem(item: unknown): string {
    if (typeof item === 'string') return item
    if (typeof item === 'object' && item !== null) {
      // For {context, text} style objects, show "context: text" summary
      const obj = item as Record<string, unknown>
      return Object.values(obj).filter(Boolean).map(String).join(': ')
    }
    return String(item)
  }

  function addItem() {
    if (!draft.trim()) return
    onChange([...items, draft.trim()])
    setDraft('')
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index))
  }

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label className="admin-field-label">{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.5rem' }}>
        {items.map((item, i) => (
          <span
            key={i}
            className="glass-tag"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            {displayItem(item)}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeItem(i)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'inherit',
                  fontSize: '0.875rem',
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                ×
              </button>
            )}
          </span>
        ))}
      </div>
      {!disabled && (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
            className="glass-input admin-field-input"
            placeholder={`Add ${label.toLowerCase()}...`}
            style={{ flex: 1 }}
          />
          <button type="button" onClick={addItem} className="admin-btn admin-btn-ghost" style={{ flexShrink: 0 }}>
            Add
          </button>
        </div>
      )}
    </div>
  )
}
