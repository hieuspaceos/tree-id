/**
 * Features hub — marketplace-style view of all modules with search, category filters.
 * Core admin only — single entry point to discover and navigate to all features.
 */
import { useState, useMemo } from 'react'
import { useLocation } from 'wouter'
import { CORE_COLLECTIONS, FEATURE_MODULES } from '@/lib/admin/feature-registry'
import type { EnabledFeaturesMap } from '@/lib/admin/feature-registry'

interface Props {
  enabledFeatures?: EnabledFeaturesMap
}

type Category = 'all' | 'content' | 'assets' | 'marketing'

interface FeatureCard {
  id: string
  label: string
  description: string
  href: string
  enabled: boolean
  category: Category
  type: 'core' | 'feature'
}

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'content', label: 'Content' },
  { id: 'assets', label: 'Assets' },
  { id: 'marketing', label: 'Marketing' },
]

export function FeaturesHub({ enabledFeatures }: Props) {
  const [, navigate] = useLocation()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Category>('all')
  const [showEnabled, setShowEnabled] = useState<'all' | 'enabled' | 'disabled'>('all')

  // Build all cards
  const allCards: FeatureCard[] = useMemo(() => {
    const core = CORE_COLLECTIONS.filter(c => c.id !== 'categories').map(col => ({
      id: col.id,
      label: col.label,
      description: `Manage ${col.label.toLowerCase()}`,
      href: col.routes.list,
      enabled: true,
      category: 'content' as Category,
      type: 'core' as const,
    }))

    const features = FEATURE_MODULES.map(f => ({
      id: f.id,
      label: f.label,
      description: f.description || '',
      href: f.navItems?.[0]?.href || `/${f.id}`,
      enabled: enabledFeatures?.[f.id] !== false,
      category: (f.section || 'content') as Category,
      type: 'feature' as const,
    }))

    return [...core, ...features]
  }, [enabledFeatures])

  // Filter
  const filtered = useMemo(() => {
    let result = allCards
    if (category !== 'all') result = result.filter(c => c.category === category)
    if (showEnabled === 'enabled') result = result.filter(c => c.enabled)
    if (showEnabled === 'disabled') result = result.filter(c => !c.enabled)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(c => c.label.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
    }
    return result
  }, [allCards, category, showEnabled, search])

  const counts = useMemo(() => ({
    all: allCards.length,
    enabled: allCards.filter(c => c.enabled).length,
    disabled: allCards.filter(c => !c.enabled).length,
  }), [allCards])

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Features</h1>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.25rem 0 0' }}>
            {counts.enabled} enabled · {counts.all} total
          </p>
        </div>
      </div>

      {/* Search + filters bar */}
      <div className="glass-panel" style={{ padding: '0.75rem', borderRadius: '12px', marginBottom: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <input
          type="text"
          placeholder="Search features..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: '1 1 200px',
            padding: '0.4rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid rgba(0,0,0,0.08)',
            fontSize: '0.8rem',
            outline: 'none',
            background: 'rgba(255,255,255,0.6)',
          }}
        />

        {/* Category pills */}
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className="admin-btn"
              style={{
                padding: '0.3rem 0.65rem',
                fontSize: '0.7rem',
                borderRadius: '9999px',
                fontWeight: 500,
                border: 'none',
                background: category === cat.id ? '#1e293b' : 'rgba(0,0,0,0.04)',
                color: category === cat.id ? '#fff' : '#64748b',
                cursor: 'pointer',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <select
          value={showEnabled}
          onChange={e => setShowEnabled(e.target.value as typeof showEnabled)}
          style={{
            padding: '0.35rem 0.5rem',
            borderRadius: '8px',
            border: '1px solid rgba(0,0,0,0.08)',
            fontSize: '0.75rem',
            background: 'rgba(255,255,255,0.6)',
            color: '#475569',
          }}
        >
          <option value="all">All status</option>
          <option value="enabled">Enabled</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      {/* Results count */}
      {(search || category !== 'all' || showEnabled !== 'all') && (
        <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          {search && ` for "${search}"`}
        </p>
      )}

      {/* Cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
        {filtered.map(card => (
          <button
            key={card.id}
            onClick={() => navigate(card.href)}
            className="glass-card"
            style={{
              padding: '1.25rem',
              textAlign: 'left',
              cursor: card.enabled ? 'pointer' : 'default',
              border: 'none',
              borderRadius: '12px',
              opacity: card.enabled ? 1 : 0.5,
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { if (card.enabled) e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
            disabled={!card.enabled}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>{card.label}</span>
              <span style={{
                fontSize: '0.55rem',
                padding: '0.1rem 0.4rem',
                borderRadius: '9999px',
                fontWeight: 600,
                background: card.type === 'core' ? 'rgba(34,197,94,0.1)' : 'rgba(99,102,241,0.1)',
                color: card.type === 'core' ? '#16a34a' : '#6366f1',
              }}>
                {card.type === 'core' ? 'CORE' : card.category.toUpperCase()}
              </span>
            </div>
            {card.description && (
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>{card.description}</p>
            )}
            <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: card.enabled ? '#22c55e' : '#94a3b8',
              }} />
              <span style={{ fontSize: '0.65rem', color: card.enabled ? '#22c55e' : '#94a3b8', fontWeight: 500 }}>
                {card.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ color: '#94a3b8' }}>No features match your filters</p>
        </div>
      )}
    </div>
  )
}
