/**
 * Landing setup wizard — 3-step flow: describe → preview → save.
 * Falls back to template picker when GEMINI_API_KEY not configured.
 */
import { useState } from 'react'
import { useLocation } from 'wouter'
import { api } from '@/lib/admin/api-client'
import type { LandingPageConfig } from '@/lib/landing/landing-types'
import { TemplatePicker } from './template-picker'

type Step = 'describe' | 'preview' | 'saving'

export function LandingSetupWizard() {
  const [, navigate] = useLocation()
  const [step, setStep] = useState<Step>('describe')
  const [description, setDescription] = useState('')
  const [slug, setSlug] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [useAI, setUseAI] = useState(true)
  const [config, setConfig] = useState<LandingPageConfig | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate() {
    if (!slug) { setError('Slug is required'); return }
    if (useAI && description.trim().length < 10) { setError('Description must be at least 10 characters'); return }
    if (!useAI && !selectedTemplate) { setError('Select a template'); return }

    setGenerating(true); setError('')

    if (useAI) {
      const res = await api.setup.generate(description, slug)
      setGenerating(false)
      if (res.ok && res.data) {
        setConfig(res.data as LandingPageConfig)
        setStep('preview')
      } else {
        setError(res.error || 'Generation failed')
        // Auto-fallback to template picker if AI fails
        setUseAI(false)
      }
    } else {
      // Template-based: fetch template and apply
      const res = await api.templates.read(selectedTemplate)
      setGenerating(false)
      if (res.ok && res.data) {
        const tmpl = res.data as any
        const newConfig: LandingPageConfig = {
          slug,
          title: tmpl.title || selectedTemplate,
          description: tmpl.description,
          template: selectedTemplate,
          sections: (tmpl.sections || []).map((s: any) => ({ ...s })),
        }
        setConfig(newConfig)
        setStep('preview')
      } else {
        setError('Failed to load template')
      }
    }
  }

  async function handleSave() {
    if (!config) return
    setStep('saving')
    const res = await api.landing.create(config as unknown as Record<string, unknown>)
    if (res.ok) {
      navigate(`/landing/${(res.data as any)?.slug || config.slug}`)
    } else {
      setError(res.error || 'Save failed')
      setStep('preview')
    }
  }

  return (
    <div style={{ maxWidth: '680px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button className="admin-btn" onClick={() => navigate('/landing')} style={{ fontSize: '0.8rem' }}>← Back</button>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>Landing Page Wizard</h1>
      </div>

      {/* Step indicators */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {(['describe', 'preview'] as const).map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {i > 0 && <span style={{ color: '#cbd5e1' }}>→</span>}
            <span style={{
              padding: '4px 12px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600,
              background: step === s ? '#3b82f6' : step === 'saving' ? '#3b82f6' : '#f1f5f9',
              color: step === s ? 'white' : step === 'saving' ? 'white' : '#64748b',
            }}>
              {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {/* Step 1: Describe */}
      {step === 'describe' && (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '14px' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <button onClick={() => setUseAI(true)} className={`admin-btn ${useAI ? 'admin-btn-primary' : ''}`} style={{ fontSize: '0.85rem' }}>
              AI Generate
            </button>
            <button onClick={() => setUseAI(false)} className={`admin-btn ${!useAI ? 'admin-btn-primary' : ''}`} style={{ fontSize: '0.85rem' }}>
              From Template
            </button>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
              Page Slug *
            </label>
            <input
              style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
              placeholder="e.g. my-product"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
            />
          </div>

          {useAI ? (
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                Describe your product *
              </label>
              <textarea
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem', minHeight: '120px', resize: 'vertical' }}
                placeholder="e.g. A SaaS tool that helps developers monitor API performance in real-time with beautiful dashboards..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                Gemini Flash will generate sections based on your description.
              </p>
            </div>
          ) : (
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                Choose a template *
              </label>
              <TemplatePicker onSelect={setSelectedTemplate} selectedName={selectedTemplate} />
            </div>
          )}

          <button className="admin-btn admin-btn-primary" onClick={handleGenerate} disabled={generating} style={{ width: '100%' }}>
            {generating ? 'Generating…' : useAI ? 'Generate with AI →' : 'Preview Template →'}
          </button>
        </div>
      )}

      {/* Step 2: Preview */}
      {(step === 'preview' || step === 'saving') && config && (
        <div>
          <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '14px', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>{config.title}</h2>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>/{config.slug}</span>
            </div>
            {config.description && <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>{config.description}</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {config.sections.map((s, i) => (
                <span key={i} style={{ padding: '3px 10px', background: '#f1f5f9', borderRadius: '99px', fontSize: '0.75rem', color: '#475569' }}>
                  {s.type}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="admin-btn" onClick={() => setStep('describe')} disabled={step === 'saving'}>
              ← Back
            </button>
            <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={step === 'saving'} style={{ flex: 1 }}>
              {step === 'saving' ? 'Saving…' : 'Save & Edit Page →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
