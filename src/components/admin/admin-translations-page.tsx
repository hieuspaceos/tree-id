/**
 * Translations management page — edit i18n strings organized by sections
 * Reads/writes JSON translation files via admin API
 */
import { useState, useEffect } from 'react'
import { getAvailableLocales, getDictionary, type Locale } from '@/lib/i18n'
import { useToast } from './admin-toast'

/** Flatten nested object to dot-path keys: { a: { b: "c" } } → { "a.b": "c" } */
function flatten(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flatten(value as Record<string, unknown>, path))
    } else if (typeof value === 'string') {
      result[path] = value
    }
  }
  return result
}

/** Group flat keys by top-level section */
function groupBySection(flat: Record<string, string>): Record<string, Record<string, string>> {
  const groups: Record<string, Record<string, string>> = {}
  for (const [key, value] of Object.entries(flat)) {
    const section = key.split('.')[0]
    if (!groups[section]) groups[section] = {}
    groups[section][key] = value
  }
  return groups
}

export function AdminTranslationsPage() {
  const toast = useToast()
  const locales = getAvailableLocales()
  const [activeLocale, setActiveLocale] = useState<Locale>(locales[0])
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [original, setOriginal] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  // Load translations for selected locale
  useEffect(() => {
    const dict = getDictionary(activeLocale)
    const flat = flatten(dict)
    setTranslations({ ...flat })
    setOriginal({ ...flat })
  }, [activeLocale])

  const grouped = groupBySection(translations)

  // Section display names from _section keys
  const sectionNames: Record<string, string> = {}
  for (const key of Object.keys(translations)) {
    if (key.endsWith('._section')) {
      const section = key.split('.')[0]
      sectionNames[section] = translations[key]
    }
  }

  function handleChange(key: string, value: string) {
    setTranslations((prev) => ({ ...prev, [key]: value }))
  }

  const hasChanges = JSON.stringify(translations) !== JSON.stringify(original)

  async function handleSave() {
    if (saving) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/translations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: activeLocale, translations }),
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('Translations saved')
        setOriginal({ ...translations })
      } else {
        toast.error(data.error || 'Save failed')
      }
    } catch {
      toast.error('Network error')
    }
    setSaving(false)
  }

  /** Filter translations by search term (key or value) */
  function matchesSearch(key: string, value: string): boolean {
    if (!search) return true
    const q = search.toLowerCase()
    return key.toLowerCase().includes(q) || value.toLowerCase().includes(q)
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.25rem' }}>
        Translations
      </h1>

      {/* Locale tabs + search */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {locales.map((loc) => (
          <button
            key={loc}
            type="button"
            onClick={() => setActiveLocale(loc)}
            className={`admin-btn ${activeLocale === loc ? 'admin-btn-primary' : 'admin-btn-ghost'}`}
            style={{ textTransform: 'uppercase', fontWeight: 600, fontSize: '0.8rem' }}
          >
            {loc}
          </button>
        ))}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search keys or values..."
          className="glass-input admin-field-input"
          style={{ flex: 1, minWidth: '200px' }}
        />
        {hasChanges && (
          <button onClick={handleSave} disabled={saving} className="admin-btn admin-btn-primary">
            {saving ? 'Saving...' : 'Save'}
          </button>
        )}
      </div>

      {/* Sections */}
      {Object.entries(grouped).map(([section, entries]) => {
        const filteredEntries = Object.entries(entries).filter(([k, v]) => matchesSearch(k, v))
        if (filteredEntries.length === 0) return null

        return (
          <div key={section} className="glass-panel" style={{ padding: '1rem', borderRadius: '14px', marginBottom: '1rem' }}>
            <button
              type="button"
              onClick={() => setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }))}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: collapsed[section] ? 0 : '0.75rem',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: collapsed[section] ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.15s ease' }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                {sectionNames[section] || section}
              </h2>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginLeft: 'auto' }}>
                {filteredEntries.length} keys
              </span>
            </button>
            {!collapsed[section] && <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {filteredEntries.map(([key, value]) => {
                const isChanged = value !== original[key]
                const isMeta = key.includes('._')
                return (
                  <div
                    key={key}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.5rem',
                      alignItems: 'center',
                      padding: '0.4rem 0.6rem',
                      borderRadius: '8px',
                      background: isChanged ? 'rgba(99,102,241,0.04)' : 'transparent',
                      border: isChanged ? '1px solid rgba(99,102,241,0.15)' : '1px solid transparent',
                    }}
                  >
                    <span style={{
                      fontSize: '0.75rem',
                      color: isMeta ? '#6366f1' : '#64748b',
                      fontFamily: 'monospace',
                      fontWeight: isMeta ? 600 : 400,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {key}
                    </span>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="glass-input"
                      style={{
                        fontSize: '0.8rem',
                        padding: '0.3rem 0.5rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(148,163,184,0.15)',
                        background: 'rgba(255,255,255,0.04)',
                      }}
                    />
                  </div>
                )
              })}
            </div>}
          </div>
        )
      })}

      {hasChanges && (
        <div style={{ position: 'sticky', bottom: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#f59e0b', alignSelf: 'center' }}>Unsaved changes</span>
          <button onClick={handleSave} disabled={saving} className="admin-btn admin-btn-primary">
            {saving ? 'Saving...' : 'Save All'}
          </button>
        </div>
      )}
    </div>
  )
}
