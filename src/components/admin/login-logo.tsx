import React from 'react'

/** Large tree logo for Payload admin login page */
export const LoginLogo: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#22c55e' }}>
      <path d="M12 22V12" />
      <path d="M12 12L8 8" />
      <path d="M12 12L16 8" />
      <path d="M12 8L9 5" />
      <path d="M12 8L15 5" />
      <path d="M12 5L10 3" />
      <path d="M12 5L14 3" />
    </svg>
    <span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#182823', letterSpacing: '-0.02em' }}>
      Tree Identity
    </span>
  </div>
)
