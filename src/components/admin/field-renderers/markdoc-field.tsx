/**
 * Markdoc content field — lazy loads Milkdown WYSIWYG editor
 * Falls back to textarea while editor loads
 */
import { lazy, Suspense } from 'react'
import type { FieldProps } from './field-props'

const MarkdocEditor = lazy(() => import('./markdoc-editor'))

export function MarkdocField({ name, label, value, onChange, error, disabled }: FieldProps) {
  if (disabled) {
    return (
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor={name} className="admin-field-label">{label}</label>
        <textarea
          id={name}
          value={(value as string) || ''}
          className="glass-input admin-field-input"
          rows={12}
          disabled
          style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.8125rem', resize: 'vertical' }}
        />
      </div>
    )
  }

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label className="admin-field-label">
        {label}
        <span style={{ color: '#94a3b8', fontWeight: 400, marginLeft: '0.5rem' }}>(Markdown)</span>
      </label>
      <Suspense
        fallback={
          <textarea
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            className="glass-input admin-field-input"
            rows={12}
            placeholder="Loading editor..."
            style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.8125rem', resize: 'vertical', minHeight: '200px' }}
          />
        }
      >
        <MarkdocEditor value={(value as string) || ''} onChange={(v) => onChange(v)} />
      </Suspense>
      {error && <p className="admin-field-error">{error}</p>}
    </div>
  )
}
