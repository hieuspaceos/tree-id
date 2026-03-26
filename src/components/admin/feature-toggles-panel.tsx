/**
 * Feature toggles panel — toggle switches for optional feature modules.
 * Rendered in Settings page, persists via site-settings singleton.
 * Each row shows: label, description, env status badge, on/off switch.
 */
import { useState, useEffect } from 'react'
import { FEATURE_MODULES, type EnabledFeaturesMap } from '@/lib/admin/feature-registry'

interface Props {
  enabledFeatures: EnabledFeaturesMap | undefined
  onChange: (featureId: string, enabled: boolean) => void
}

export function FeatureTogglesPanel({ enabledFeatures, onChange }: Props) {
  const [envStatus, setEnvStatus] = useState<Record<string, boolean>>({})
  const [envLoaded, setEnvLoaded] = useState(false)

  // Fetch integration status for env check badges
  useEffect(() => {
    fetch('/api/admin/integrations')
      .then((r) => r.json())
      .then((data) => {
        if (!data.ok) return
        const map: Record<string, boolean> = {}
        for (const item of data.data) {
          // Map env vars to feature IDs
          for (const feature of FEATURE_MODULES) {
            if (feature.envCheck?.includes(item.envVar)) {
              map[feature.id] = item.configured
            }
          }
        }
        setEnvStatus(map)
        setEnvLoaded(true)
      })
      .catch(() => setEnvLoaded(true))
  }, [])

  const isEnabled = (id: string) => {
    if (!enabledFeatures) return true
    return enabledFeatures[id] !== false
  }

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>
        Feature Modules
      </h2>
      <div className="glass-panel" style={{ padding: '1rem', borderRadius: '14px' }}>
        <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem' }}>
          Toggle features on/off. Disabled features hide from sidebar and block API access.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {FEATURE_MODULES.map((feature) => {
            const enabled = isEnabled(feature.id)
            const needsEnv = feature.envCheck && feature.envCheck.length > 0
            const envOk = needsEnv && envLoaded ? envStatus[feature.id] === true : undefined

            return (
              <div
                key={feature.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  background: enabled ? 'rgba(99,102,241,0.04)' : 'rgba(148,163,184,0.06)',
                  border: `1px solid ${enabled ? 'rgba(99,102,241,0.12)' : 'rgba(148,163,184,0.1)'}`,
                  opacity: enabled ? 1 : 0.7,
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                    {feature.label}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {feature.description}
                    {needsEnv && envOk !== undefined && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: envOk ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                          color: envOk ? '#22c55e' : '#f59e0b',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {envOk ? 'ENV ready' : `Set ${feature.envCheck![0]}`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Toggle switch */}
                <button
                  type="button"
                  onClick={() => onChange(feature.id, !enabled)}
                  style={{
                    position: 'relative',
                    width: '40px',
                    height: '22px',
                    borderRadius: '11px',
                    border: 'none',
                    cursor: 'pointer',
                    background: enabled ? '#6366f1' : '#cbd5e1',
                    transition: 'background 0.15s ease',
                    flexShrink: 0,
                  }}
                  title={`${enabled ? 'Disable' : 'Enable'} ${feature.label}`}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: '2px',
                      left: enabled ? '20px' : '2px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#fff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                      transition: 'left 0.15s ease',
                    }}
                  />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
