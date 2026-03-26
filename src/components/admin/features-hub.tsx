/**
 * Features hub — grid view of all available modules (core collections + feature modules).
 * Core admin only — provides single entry point to all features.
 */
import { useLocation } from 'wouter'
import { CORE_COLLECTIONS, FEATURE_MODULES } from '@/lib/admin/feature-registry'
import type { EnabledFeaturesMap } from '@/lib/admin/feature-registry'

interface Props {
  enabledFeatures?: EnabledFeaturesMap
}

export function FeaturesHub({ enabledFeatures }: Props) {
  const [, navigate] = useLocation()

  // Core collections as feature cards
  const coreCards = CORE_COLLECTIONS.filter(c => c.id !== 'categories').map(col => ({
    id: col.id,
    label: col.label,
    description: `Manage ${col.label.toLowerCase()}`,
    href: col.routes.list,
    enabled: true,
    type: 'core' as const,
  }))

  // Feature modules as feature cards
  const featureCards = FEATURE_MODULES.map(f => ({
    id: f.id,
    label: f.label,
    description: f.description || '',
    href: f.navItems?.[0]?.href || `/${f.id}`,
    enabled: enabledFeatures?.[f.id] !== false,
    type: 'feature' as const,
  }))

  const allCards = [...coreCards, ...featureCards]

  return (
    <div>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.25rem' }}>
        Features
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
        {allCards.map(card => (
          <button
            key={card.id}
            onClick={() => navigate(card.href)}
            className="glass-card"
            style={{
              padding: '1.25rem',
              textAlign: 'left',
              cursor: 'pointer',
              border: 'none',
              borderRadius: '12px',
              opacity: card.enabled ? 1 : 0.5,
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>{card.label}</span>
              {card.type === 'core' && (
                <span style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: '9999px', background: 'rgba(34,197,94,0.1)', color: '#16a34a', fontWeight: 600 }}>
                  CORE
                </span>
              )}
            </div>
            {card.description && (
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>{card.description}</p>
            )}
            {!card.enabled && (
              <p style={{ fontSize: '0.65rem', color: '#f59e0b', margin: '0.5rem 0 0', fontWeight: 500 }}>Not enabled</p>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
