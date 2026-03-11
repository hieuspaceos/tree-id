/**
 * Single-line text input field with glass styling
 * Optionally shows "Browse Media" button for URL fields
 */
import { useState } from 'react'
import type { FieldProps } from './field-props'
import { MediaBrowser } from '../media-browser'

export function TextField({ name, label, value, onChange, error, required, disabled, mediaBrowse }: FieldProps) {
  const [showMedia, setShowMedia] = useState(false)

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor={name} className="admin-field-label">
        {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
      </label>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          id={name}
          type="text"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          className="glass-input admin-field-input"
          disabled={disabled}
          style={{ flex: 1 }}
        />
        {mediaBrowse && !disabled && (
          <button
            type="button"
            className="admin-btn admin-btn-ghost"
            onClick={() => setShowMedia(true)}
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
          >
            Browse
          </button>
        )}
      </div>
      {error && <p className="admin-field-error">{error}</p>}
      {showMedia && (
        <MediaBrowser
          mode="dialog"
          onSelect={(url) => onChange(url)}
          onClose={() => setShowMedia(false)}
        />
      )}
    </div>
  )
}
