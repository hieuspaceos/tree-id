/**
 * Template picker — non-AI fallback for selecting a template to create a landing page.
 * Shows available templates with description and target audience.
 */
import { useEffect, useState } from 'react'
import { api } from '@/lib/admin/api-client'

interface Template {
  name: string
  description?: string
  targetAudience?: string
}

interface Props {
  onSelect: (templateName: string) => void
  selectedName?: string
}

export function TemplatePicker({ onSelect, selectedName }: Props) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.templates.list().then((res) => {
      setTemplates((res.data as any)?.entries || [])
      setLoading(false)
    })
  }, [])

  if (loading) return <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Loading templates...</p>

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
      {templates.map((t) => (
        <button
          key={t.name}
          type="button"
          onClick={() => onSelect(t.name)}
          style={{
            textAlign: 'left',
            padding: '1rem',
            borderRadius: '10px',
            border: selectedName === t.name ? '2px solid #3b82f6' : '2px solid #e2e8f0',
            background: selectedName === t.name ? '#eff6ff' : 'white',
            cursor: 'pointer',
            transition: 'border-color 0.15s',
          }}
        >
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b', marginBottom: '0.25rem', textTransform: 'capitalize' }}>
            {t.name}
          </div>
          {t.description && (
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>{t.description}</div>
          )}
          {t.targetAudience && (
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>For: {t.targetAudience}</div>
          )}
        </button>
      ))}
    </div>
  )
}
