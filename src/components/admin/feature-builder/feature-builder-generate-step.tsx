/**
 * Feature builder generate step — triggers code generation from approved spec,
 * displays file list, registry snippet, and warnings.
 */
import { useState } from 'react'
import { useLocation } from 'wouter'
import type { SkillSpec } from '@/lib/admin/feature-builder-spec-types'
import { api } from '@/lib/admin/api-client'

interface Props {
  spec: SkillSpec
  savedPath: string
  onReset: () => void
}

interface GenerateData {
  files: string[]
  registrySnippet: string
  warnings: string[]
}

function categorizeFiles(files: string[]): Record<string, string[]> {
  return {
    'Skill Files': files.filter(f => f.startsWith('.claude/')),
    'Admin Components': files.filter(f => f.startsWith('src/components/')),
    'API Routes': files.filter(f => f.startsWith('src/pages/api/')),
    'Content & Config': files.filter(f => f.startsWith('src/content/')),
  }
}

export function FeatureBuilderGenerateStep({ spec, savedPath, onReset }: Props) {
  const [, navigate] = useLocation()
  const [status, setStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<GenerateData | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function handleGenerate() {
    setStatus('generating')
    setError('')
    const res = await api.featureBuilder.generate(spec)
    if (res.ok && res.data) {
      setResult(res.data as GenerateData)
      setStatus('done')
    } else {
      setError(res.error || 'Generation failed')
      setStatus('error')
    }
  }

  function copySnippet() {
    if (result?.registrySnippet) {
      navigator.clipboard.writeText(result.registrySnippet).catch(() => {})
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Idle — show Generate button
  if (status === 'idle') {
    return (
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '14px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.75rem' }}>Generate Code</h2>
        <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 0.5rem' }}>
          Spec saved to: <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>{savedPath}</code>
        </p>
        <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 1.25rem' }}>
          This will generate a Claude skill folder + admin components + API route + content directory.
        </p>
        <button className="admin-btn admin-btn-primary" onClick={handleGenerate} style={{ width: '100%' }}>
          Generate Code
        </button>
      </div>
    )
  }

  // Generating — spinner
  if (status === 'generating') {
    return (
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '14px', textAlign: 'center' }}>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Generating files…</p>
      </div>
    )
  }

  // Error — retry
  if (status === 'error') {
    return (
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '14px' }}>
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.6rem 0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.8rem' }}>
          {error}
        </div>
        <button className="admin-btn admin-btn-primary" onClick={handleGenerate}>Retry</button>
      </div>
    )
  }

  // Done — show results
  const categories = result ? categorizeFiles(result.files) : {}

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '14px' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#16a34a', margin: '0 0 1rem' }}>
        Generated {result?.files.length || 0} files
      </h2>

      {/* File list by category */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
        {Object.entries(categories).map(([cat, files]) => files.length > 0 && (
          <div key={cat} className="glass-card" style={{ padding: '0.75rem 1rem', borderRadius: '10px' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.4rem' }}>{cat}</h3>
            {files.map(f => (
              <div key={f} style={{ fontSize: '0.78rem', color: '#475569', fontFamily: 'monospace', padding: '1px 0' }}>{f}</div>
            ))}
          </div>
        ))}
      </div>

      {/* Warnings */}
      {result?.warnings && result.warnings.length > 0 && (
        <div style={{ background: '#fef3c7', color: '#92400e', padding: '0.6rem 0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.78rem' }}>
          {result.warnings.map((w, i) => <div key={i}>{w}</div>)}
        </div>
      )}

      {/* Registry snippet */}
      {result?.registrySnippet && (
        <div className="glass-card" style={{ padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Registry Snippet</h3>
            <button className="admin-btn" onClick={copySnippet} style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre style={{ fontSize: '0.72rem', color: '#475569', background: '#f8fafc', padding: '0.5rem', borderRadius: '6px', margin: 0, whiteSpace: 'pre-wrap', overflow: 'auto' }}>
            {result.registrySnippet}
          </pre>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button className="admin-btn" onClick={onReset}>Create Another</button>
        <button className="admin-btn admin-btn-primary" onClick={() => navigate('/settings')}>Back to Admin</button>
      </div>
    </div>
  )
}
