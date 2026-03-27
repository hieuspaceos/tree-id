/**
 * Landing page clone modal — paste a URL, AI analyzes and creates sections + design.
 * Shows progress states: idle → analyzing → done/error.
 */
import { useState } from 'react'
import { api } from '@/lib/admin/api-client'
import type { LandingPageConfig } from '@/lib/landing/landing-types'

interface Props {
  onClose: () => void
  onCloned: (config: LandingPageConfig) => void
}

export function LandingCloneModal({ onClose, onCloned }: Props) {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'error'>('idle')
  const [error, setError] = useState('')

  async function handleClone() {
    if (!url.trim()) return
    setStatus('analyzing')
    setError('')

    const res = await api.landing.clone(url.trim())
    if (res.ok && res.data) {
      const data = res.data as LandingPageConfig
      onCloned(data)
    } else {
      setError(res.error || 'Failed to analyze page')
      setStatus('error')
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        background: 'white', borderRadius: '16px', padding: '2rem',
        maxWidth: '480px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Clone Landing Page
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
          Paste a URL and AI will analyze the page structure, extract content, colors, and create a matching landing page.
        </p>

        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/landing"
          disabled={status === 'analyzing'}
          onKeyDown={(e) => e.key === 'Enter' && handleClone()}
          style={{
            width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px',
            border: '1px solid #e2e8f0', fontSize: '0.85rem', marginBottom: '0.75rem',
            opacity: status === 'analyzing' ? 0.6 : 1,
          }}
          autoFocus
        />

        {error && (
          <p style={{ fontSize: '0.75rem', color: '#dc2626', marginBottom: '0.75rem', background: '#fee2e2', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
            {error}
          </p>
        )}

        {status === 'analyzing' && (
          <div style={{ textAlign: 'center', padding: '1rem 0', color: '#64748b', fontSize: '0.8rem' }}>
            <div style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>⏳</div>
            Analyzing page structure...
            <br />
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>This may take 10-20 seconds</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={status === 'analyzing'}
            style={{
              padding: '0.4rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0',
              background: 'white', cursor: 'pointer', fontSize: '0.8rem',
            }}
          >Cancel</button>
          <button
            onClick={handleClone}
            disabled={!url.trim() || status === 'analyzing'}
            style={{
              padding: '0.4rem 1.25rem', borderRadius: '8px', border: 'none',
              background: status === 'analyzing' ? '#94a3b8' : '#3b82f6',
              color: 'white', cursor: status === 'analyzing' ? 'not-allowed' : 'pointer',
              fontSize: '0.8rem', fontWeight: 600,
            }}
          >{status === 'analyzing' ? 'Analyzing...' : 'Clone'}</button>
        </div>
      </div>
    </div>
  )
}
