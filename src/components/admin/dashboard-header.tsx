import React from 'react'

/** Glass-styled welcome header injected before the default Payload dashboard */
export const DashboardHeader: React.FC = () => (
  <div
    style={{
      background: 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(16px) saturate(1.6)',
      WebkitBackdropFilter: 'blur(16px) saturate(1.6)',
      border: '1px solid rgba(255,255,255,0.35)',
      borderRadius: '16px',
      padding: '28px 32px',
      marginBottom: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.6)',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div
        style={{
          background: 'rgba(34,197,94,0.1)',
          borderRadius: '14px',
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#22c55e' }}>
          <path d="M12 22V12" />
          <path d="M12 12L8 8" />
          <path d="M12 12L16 8" />
          <path d="M12 8L9 5" />
          <path d="M12 8L15 5" />
          <path d="M12 5L10 3" />
          <path d="M12 5L14 3" />
        </svg>
      </div>
      <div>
        <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 600, color: '#182823', letterSpacing: '-0.01em' }}>
          Tree Identity
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#708a82' }}>
          Digital Twin content engine — manage your seeds, articles, and media.
        </p>
      </div>
    </div>
  </div>
)
