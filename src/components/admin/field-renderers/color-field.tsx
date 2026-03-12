/**
 * Color picker field — native input[type=color] with hex text display
 */
import type { FieldProps } from './field-props'

export function ColorField({ name, label, value, onChange, error, disabled }: FieldProps) {
  const colorValue = (value as string) || '#6366f1'

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor={name} className="admin-field-label">{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input
          id={name}
          type="color"
          value={colorValue}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          style={{ width: '36px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: 0 }}
        />
        <input
          type="text"
          value={colorValue}
          onChange={(e) => onChange(e.target.value)}
          className="glass-input admin-field-input"
          disabled={disabled}
          style={{ flex: 1 }}
          placeholder="#6366f1"
        />
      </div>
      {error && <p className="admin-field-error">{error}</p>}
    </div>
  )
}
