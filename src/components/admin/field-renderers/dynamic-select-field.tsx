/**
 * Dynamic select field — fetches options from an API endpoint on mount
 * Used for category selection where options come from a managed collection
 */
import { useState, useEffect } from 'react'
import type { FieldProps } from './field-props'

interface DynamicSelectProps extends FieldProps {
  apiEndpoint?: string
}

export function DynamicSelectField({ name, label, value, onChange, error, required, disabled, apiEndpoint }: DynamicSelectProps) {
  const [options, setOptions] = useState<Array<{ label: string; value: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!apiEndpoint) { setLoading(false); return }
    fetch(apiEndpoint)
      .then((res) => res.json())
      .then((res) => {
        if (res.ok && res.data?.entries) {
          setOptions(
            res.data.entries.map((e: { slug: string; title?: string; name?: string }) => ({
              label: e.title || e.name || e.slug,
              value: e.slug,
            })),
          )
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [apiEndpoint])

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor={name} className="admin-field-label">
        {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
      </label>
      <select
        id={name}
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        className="glass-input admin-field-input"
        disabled={disabled || loading}
      >
        <option value="">{loading ? 'Loading...' : 'Select...'}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="admin-field-error">{error}</p>}
    </div>
  )
}
