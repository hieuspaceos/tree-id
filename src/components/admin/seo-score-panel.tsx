/**
 * SEO score panel — replaces collapsible SEO section in editor sidebar
 * Shows score badge, focus keyword input, per-check breakdown by category
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { analyzeSeo, type SeoCheck } from '@/lib/admin/seo-analyzer'
import { SeoScoreBadge } from './seo-score-badge'
import { renderField } from './field-renderers/render-field'
import type { FieldSchema } from '@/lib/admin/schema-registry'

interface Props {
  values: Record<string, unknown>
  slug: string
  seoFields: FieldSchema[] // seoTitle, ogImage, noindex
  onObjectChange: (parentName: string, childName: string, value: unknown) => void
  errors: Record<string, string>
}

/** Group checks by category */
function groupByCategory(checks: SeoCheck[]): Record<string, SeoCheck[]> {
  const groups: Record<string, SeoCheck[]> = {}
  for (const c of checks) {
    ;(groups[c.category] ||= []).push(c)
  }
  return groups
}

export function SeoScorePanel({ values, slug, seoFields, onObjectChange, errors }: Props) {
  const [openCats, setOpenCats] = useState<Set<string>>(new Set(['Basic SEO']))
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [result, setResult] = useState(() => analyzeSeo(buildInput(values, slug)))

  // Debounced recalculation on value changes
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setResult(analyzeSeo(buildInput(values, slug)))
    }, 500)
    return () => clearTimeout(debounceRef.current)
  }, [values, slug])

  const grouped = useMemo(() => groupByCategory(result.checks), [result])
  const seo = (values.seo as Record<string, unknown>) || {}
  const categories = ['Basic SEO', 'Title Readability', 'Content', 'Additional']

  function toggleCat(cat: string) {
    setOpenCats((prev) => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  // Filter out focusKeyword from seoFields (we render it separately)
  const otherSeoFields = seoFields.filter((f) => f.name !== 'focusKeyword')

  return (
    <div className="editor-panel-box">
      {/* Header with badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <SeoScoreBadge score={result.score} size={44} />
        <div>
          <div className="editor-panel-box-title" style={{ marginBottom: 0 }}>SEO Score</div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
            {result.score}/100 — {result.checks.filter((c) => c.pass).length}/{result.checks.length} checks passed
          </div>
        </div>
      </div>

      {/* Focus keyword input */}
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
          Focus Keyword
        </label>
        <input
          type="text"
          className="glass-input"
          placeholder="e.g. astro keystatic blog"
          value={(seo.focusKeyword as string) || ''}
          onChange={(e) => onObjectChange('seo', 'focusKeyword', e.target.value)}
          style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.8125rem' }}
        />
      </div>

      {/* Existing SEO fields (seoTitle, ogImage, noindex) */}
      {otherSeoFields.map((f) =>
        renderField(f, seo[f.name], (v) => onObjectChange('seo', f.name, v), false, errors[`seo.${f.name}`]),
      )}

      {/* Category accordions */}
      <div style={{ marginTop: '0.75rem', borderTop: '1px solid rgba(148,163,184,0.15)', paddingTop: '0.5rem' }}>
        {categories.map((cat) => {
          const checks = grouped[cat] || []
          const passed = checks.filter((c) => c.pass).length
          const isOpen = openCats.has(cat)

          return (
            <div key={cat} style={{ marginBottom: '0.25rem' }}>
              <div
                className="editor-collapsible-header"
                onClick={() => toggleCat(cat)}
                style={{ padding: '0.35rem 0' }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e293b' }}>
                  {cat}
                  <span style={{ fontWeight: 400, color: '#94a3b8', marginLeft: '0.5rem' }}>
                    {passed}/{checks.length}
                  </span>
                </span>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 150ms' }}>
                  ▶
                </span>
              </div>
              {isOpen && (
                <div style={{ paddingLeft: '0.25rem', paddingBottom: '0.25rem' }}>
                  {checks.map((c) => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', padding: '0.2rem 0', fontSize: '0.75rem' }}>
                      <span style={{ flexShrink: 0, width: '14px', textAlign: 'center' }}>
                        {c.pass ? '✓' : '✗'}
                      </span>
                      <span style={{ color: c.pass ? '#64748b' : '#1e293b' }}>{c.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Build analyzer input from form values */
function buildInput(values: Record<string, unknown>, slug: string) {
  const seo = (values.seo as Record<string, string>) || {}
  const cover = (values.cover as Record<string, string>) || {}
  const links = (values.links as Record<string, unknown>) || {}
  return {
    title: (values.title as string) || '',
    description: (values.description as string) || '',
    slug,
    content: (values.content as string) || '',
    seo,
    cover,
    tags: (values.tags as string[]) || [],
    links: { outbound: (links.outbound as string[]) || [] },
  }
}
