/**
 * AI Wizard — multi-step clone with intent clarification and section picker.
 * Step 1: URL + intent description
 * Step 2: AI analyzing (loading)
 * Step 3: Review detected sections (checkboxes) + design preview
 * Error: retry or cancel
 */
import { useState } from 'react'
import { api } from '@/lib/admin/api-client'
import type { LandingPageConfig } from '@/lib/landing/landing-types'

interface Props {
  onClose: () => void
  onCloned: (config: LandingPageConfig) => void
}

// Section type labels for display
const TYPE_LABELS: Record<string, string> = {
  nav: '🧭 Navigation', hero: '🎯 Hero', features: '✨ Features',
  pricing: '💰 Pricing', testimonials: '💬 Testimonials', faq: '❓ FAQ',
  cta: '🚀 Call to Action', stats: '📊 Stats', 'how-it-works': '🔄 How It Works',
  team: '👥 Team', 'logo-wall': '🏢 Logo Wall', footer: '📄 Footer',
  video: '🎬 Video', image: '🖼 Image', 'image-text': '📰 Image+Text',
  gallery: '🗃 Gallery', map: '📍 Map', 'rich-text': '📝 Rich Text',
  divider: '➖ Divider', countdown: '⏱ Countdown', 'contact-form': '📬 Contact',
  banner: '📣 Banner', comparison: '⚖️ Comparison', 'ai-search': '🔍 AI Search',
  'social-proof': '🏅 Social Proof', layout: '⬜ Layout',
}

type Step = 'input' | 'analyzing' | 'review' | 'error'

type SourceMode = 'url' | 'code'

export function LandingCloneModal({ onClose, onCloned }: Props) {
  const [sourceMode, setSourceMode] = useState<SourceMode>('url')
  const [url, setUrl] = useState('')
  const [code, setCode] = useState('')
  const [intent, setIntent] = useState('')
  const [step, setStep] = useState<Step>('input')
  const [error, setError] = useState('')
  const [result, setResult] = useState<LandingPageConfig | null>(null)
  const [selectedSections, setSelectedSections] = useState<Set<number>>(new Set())

  const hasSource = sourceMode === 'url' ? url.trim() : code.trim()

  async function handleAnalyze() {
    if (!hasSource || !intent.trim()) return
    setStep('analyzing')
    setError('')

    // For code mode, pass the HTML directly as a data URL so the API can process it
    const source = sourceMode === 'url' ? url.trim() : `data:text/html,${encodeURIComponent(code.trim())}`
    const res = await api.landing.clone(source, intent.trim())
    if (res.ok && res.data) {
      const data = res.data as LandingPageConfig
      setResult(data)
      setSelectedSections(new Set(data.sections.map((_, i) => i)))
      setStep('review')
    } else {
      setError(res.error || 'Failed to analyze page')
      setStep('error')
    }
  }

  function toggleSection(index: number) {
    setSelectedSections(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  function handleApply() {
    if (!result) return
    const filtered = result.sections.filter((_, i) => selectedSections.has(i))
    onCloned({ ...result, sections: filtered })
  }

  const canAnalyze = hasSource && intent.trim()

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={(e) => { if (e.target === e.currentTarget && step !== 'analyzing') onClose() }}
    >
      <div style={{ background: 'white', borderRadius: '16px', padding: '1.75rem', maxWidth: step === 'review' ? '640px' : '480px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>

        {/* STEP 1: Input */}
        {step === 'input' && (<>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>AI Wizard</h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem' }}>
            Provide a source and describe your intent. AI will analyze and let you pick which sections to create.
          </p>

          {/* Source mode tabs */}
          <div style={{ display: 'flex', gap: '0', marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
            {(['url', 'code'] as const).map(mode => (
              <button key={mode} onClick={() => setSourceMode(mode)}
                style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', fontWeight: 500, border: 'none', background: 'none', cursor: 'pointer', borderBottom: sourceMode === mode ? '2px solid #3b82f6' : '2px solid transparent', color: sourceMode === mode ? '#3b82f6' : '#64748b' }}>
                {mode === 'url' ? '🔗 From URL' : '📋 Paste Code'}
              </button>
            ))}
          </div>

          {sourceMode === 'url' && (<>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem', display: 'block' }}>Source URL *</label>
            <input
              type="url" value={url} onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', marginBottom: '0.75rem', boxSizing: 'border-box' }}
              autoFocus
            />
          </>)}

          {sourceMode === 'code' && (<>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem', display: 'block' }}>Paste HTML / Code *</label>
            <textarea
              value={code} onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your HTML, JSX, or page source code here..."
              style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem', fontFamily: 'monospace', minHeight: '100px', resize: 'vertical', marginBottom: '0.75rem', boxSizing: 'border-box' }}
              autoFocus
            />
          </>)}

          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem', display: 'block' }}>What is this site about? *</label>
          <textarea
            value={intent} onChange={(e) => setIntent(e.target.value)}
            placeholder="e.g. A SaaS product for AI development tools, selling engineer and marketing kits..."
            onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey && canAnalyze) handleAnalyze() }}
            style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', minHeight: '80px', resize: 'vertical', marginBottom: '1rem', boxSizing: 'border-box' }}
          />

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ padding: '0.4rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '0.8rem' }}>Cancel</button>
            <button
              onClick={handleAnalyze} disabled={!canAnalyze}
              style={{ padding: '0.4rem 1.25rem', borderRadius: '8px', border: 'none', background: canAnalyze ? '#3b82f6' : '#94a3b8', color: 'white', cursor: canAnalyze ? 'pointer' : 'not-allowed', fontSize: '0.8rem', fontWeight: 600 }}
            >Analyze →</button>
          </div>
        </>)}

        {/* STEP 2: Analyzing */}
        {step === 'analyzing' && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem', display: 'inline-block', animation: 'spin 2s linear infinite' }}>⚙️</div>
            <p style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' }}>Analyzing page...</p>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>AI is reading the page structure, extracting content and design</p>
            <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.5rem' }}>This may take 15-30 seconds</p>
            <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        {/* STEP 3: Review — section picker */}
        {step === 'review' && result && (<>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Review Sections</h2>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.25rem 0 0' }}>
                {selectedSections.size} of {result.sections.length} sections selected
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setSelectedSections(new Set(result.sections.map((_, i) => i)))} style={{ fontSize: '0.7rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>Select All</button>
              <button onClick={() => setSelectedSections(new Set())} style={{ fontSize: '0.7rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>Deselect All</button>
            </div>
          </div>

          {/* Design color preview */}
          {result.design?.colors && (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.7rem', color: '#64748b', marginRight: '0.25rem' }}>Colors:</span>
              {Object.entries(result.design.colors).filter(([, v]) => v).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: v as string, border: '1px solid #e2e8f0' }} />
                  <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>{k}</span>
                </div>
              ))}
            </div>
          )}

          {/* Section list with checkboxes */}
          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '0.75rem', maxHeight: '400px' }}>
            {result.sections.map((section, i) => {
              const label = TYPE_LABELS[section.type] || section.type
              const data = section.data as Record<string, unknown>
              const preview = (data.headline || data.heading || data.text || data.brandName || data.content || '') as string
              return (
                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: '8px', cursor: 'pointer', background: selectedSections.has(i) ? '#f0f9ff' : 'transparent', border: `1px solid ${selectedSections.has(i) ? '#bfdbfe' : 'transparent'}`, marginBottom: '0.25rem' }}>
                  <input type="checkbox" checked={selectedSections.has(i)} onChange={() => toggleSection(i)} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{label}</span>
                      {!!((section.data as Record<string, unknown>)?.variant) && (
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8', background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{String((section.data as Record<string, unknown>).variant)}</span>
                      )}
                    </div>
                    {preview && (
                      <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '0.15rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {typeof preview === 'string' ? preview.slice(0, 80) : ''}
                      </p>
                    )}
                  </div>
                </label>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button onClick={() => setStep('input')} style={{ padding: '0.4rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '0.8rem' }}>← Back</button>
            <button onClick={onClose} style={{ padding: '0.4rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '0.8rem' }}>Cancel</button>
            <button
              onClick={handleApply} disabled={selectedSections.size === 0}
              style={{ padding: '0.4rem 1.25rem', borderRadius: '8px', border: 'none', background: selectedSections.size === 0 ? '#94a3b8' : '#3b82f6', color: 'white', cursor: selectedSections.size === 0 ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
            >Apply {selectedSections.size} Sections</button>
          </div>
        </>)}

        {/* ERROR state */}
        {step === 'error' && (<>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Analysis Failed</h2>
          <p style={{ fontSize: '0.8rem', color: '#dc2626', marginBottom: '1rem', background: '#fee2e2', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
            {error}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ padding: '0.4rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '0.8rem' }}>Cancel</button>
            <button onClick={() => setStep('input')} style={{ padding: '0.4rem 1.25rem', borderRadius: '8px', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Try Again</button>
          </div>
        </>)}

      </div>
    </div>
  )
}
