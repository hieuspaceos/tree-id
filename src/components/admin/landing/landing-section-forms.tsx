/**
 * Per-section-type form components for landing page editor.
 * Each form renders inputs for its typed section data.
 * Dynamic array support: items[] with add/remove.
 */
import type { SectionData, HeroData, FeaturesData, PricingData, TestimonialsData, FaqData, CtaData, StatsData, HowItWorksData, TeamData, LogoWallData } from '@/lib/landing/landing-types'

type FormProps<T extends SectionData> = { data: T; onChange: (data: T) => void }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle = { width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem', background: 'white' }
const textareaStyle = { ...inputStyle, minHeight: '70px', resize: 'vertical' as const }

function ArrayField({ label, items, onChange }: { label: string; items: string[]; onChange: (items: string[]) => void }) {
  return (
    <Field label={label}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <input style={{ ...inputStyle, flex: 1 }} value={item}
            onChange={(e) => { const n = [...items]; n[i] = e.target.value; onChange(n) }} />
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))}
            style={{ padding: '4px 8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            ×
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ''])}
        style={{ fontSize: '0.75rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}>
        + Add
      </button>
    </Field>
  )
}

export function HeroSectionForm({ data, onChange }: FormProps<HeroData>) {
  const set = (k: keyof HeroData, v: unknown) => onChange({ ...data, [k]: v })
  return (
    <>
      <Field label="Headline"><input style={inputStyle} value={data.headline || ''} onChange={(e) => set('headline', e.target.value)} /></Field>
      <Field label="Subheadline"><textarea style={textareaStyle} value={data.subheadline || ''} onChange={(e) => set('subheadline', e.target.value)} /></Field>
      <Field label="CTA Text"><input style={inputStyle} value={data.cta?.text || ''} onChange={(e) => set('cta', { ...data.cta, text: e.target.value, url: data.cta?.url || '#' })} /></Field>
      <Field label="CTA URL"><input style={inputStyle} value={data.cta?.url || ''} onChange={(e) => set('cta', { ...data.cta, url: e.target.value, text: data.cta?.text || 'Get Started' })} /></Field>
    </>
  )
}

export function FeaturesSectionForm({ data, onChange }: FormProps<FeaturesData>) {
  const set = (k: keyof FeaturesData, v: unknown) => onChange({ ...data, [k]: v })
  const items = data.items || []
  return (
    <>
      <Field label="Heading"><input style={inputStyle} value={data.heading || ''} onChange={(e) => set('heading', e.target.value)} /></Field>
      <Field label="Subheading"><input style={inputStyle} value={data.subheading || ''} onChange={(e) => set('subheading', e.target.value)} /></Field>
      <Field label="Feature Items">
        {items.map((item, i) => (
          <div key={i} style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.5rem' }}>
            <input placeholder="Title" style={{ ...inputStyle, marginBottom: '4px' }} value={item.title} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], title: e.target.value }; set('items', n) }} />
            <textarea placeholder="Description" style={{ ...textareaStyle, minHeight: '50px' }} value={item.description} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], description: e.target.value }; set('items', n) }} />
            <button type="button" onClick={() => set('items', items.filter((_, j) => j !== i))}
              style={{ fontSize: '0.75rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={() => set('items', [...items, { title: '', description: '' }])}
          style={{ fontSize: '0.75rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>+ Add Feature</button>
      </Field>
    </>
  )
}

export function PricingSectionForm({ data, onChange }: FormProps<PricingData>) {
  const set = (k: keyof PricingData, v: unknown) => onChange({ ...data, [k]: v })
  const plans = data.plans || []
  return (
    <>
      <Field label="Heading"><input style={inputStyle} value={data.heading || ''} onChange={(e) => set('heading', e.target.value)} /></Field>
      <Field label="Plans">
        {plans.map((plan, i) => (
          <div key={i} style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.5rem' }}>
            <input placeholder="Plan name" style={{ ...inputStyle, marginBottom: '4px' }} value={plan.name} onChange={(e) => { const n = [...plans]; n[i] = { ...n[i], name: e.target.value }; set('plans', n) }} />
            <input placeholder="Price (e.g. $29)" style={{ ...inputStyle, marginBottom: '4px' }} value={plan.price} onChange={(e) => { const n = [...plans]; n[i] = { ...n[i], price: e.target.value }; set('plans', n) }} />
            <button type="button" onClick={() => set('plans', plans.filter((_, j) => j !== i))}
              style={{ fontSize: '0.75rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={() => set('plans', [...plans, { name: '', price: '', features: [], cta: { text: 'Get started', url: '#' } }])}
          style={{ fontSize: '0.75rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>+ Add Plan</button>
      </Field>
    </>
  )
}

export function TestimonialsSectionForm({ data, onChange }: FormProps<TestimonialsData>) {
  const set = (k: keyof TestimonialsData, v: unknown) => onChange({ ...data, [k]: v })
  const items = data.items || []
  return (
    <>
      <Field label="Heading"><input style={inputStyle} value={data.heading || ''} onChange={(e) => set('heading', e.target.value)} /></Field>
      <Field label="Testimonials">
        {items.map((item, i) => (
          <div key={i} style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.5rem' }}>
            <textarea placeholder="Quote" style={{ ...textareaStyle, minHeight: '50px', marginBottom: '4px' }} value={item.quote} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], quote: e.target.value }; set('items', n) }} />
            <input placeholder="Name" style={{ ...inputStyle, marginBottom: '4px' }} value={item.name} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], name: e.target.value }; set('items', n) }} />
            <input placeholder="Role" style={inputStyle} value={item.role || ''} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], role: e.target.value }; set('items', n) }} />
            <button type="button" onClick={() => set('items', items.filter((_, j) => j !== i))}
              style={{ fontSize: '0.75rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', marginTop: '4px' }}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={() => set('items', [...items, { quote: '', name: '' }])}
          style={{ fontSize: '0.75rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>+ Add Testimonial</button>
      </Field>
    </>
  )
}

export function FaqSectionForm({ data, onChange }: FormProps<FaqData>) {
  const set = (k: keyof FaqData, v: unknown) => onChange({ ...data, [k]: v })
  const items = data.items || []
  return (
    <>
      <Field label="Heading"><input style={inputStyle} value={data.heading || ''} onChange={(e) => set('heading', e.target.value)} /></Field>
      <Field label="FAQ Items">
        {items.map((item, i) => (
          <div key={i} style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.5rem' }}>
            <input placeholder="Question" style={{ ...inputStyle, marginBottom: '4px' }} value={item.question} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], question: e.target.value }; set('items', n) }} />
            <textarea placeholder="Answer" style={{ ...textareaStyle, minHeight: '60px' }} value={item.answer} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], answer: e.target.value }; set('items', n) }} />
            <button type="button" onClick={() => set('items', items.filter((_, j) => j !== i))}
              style={{ fontSize: '0.75rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={() => set('items', [...items, { question: '', answer: '' }])}
          style={{ fontSize: '0.75rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>+ Add FAQ</button>
      </Field>
    </>
  )
}

export function CtaSectionForm({ data, onChange }: FormProps<CtaData>) {
  const set = (k: keyof CtaData, v: unknown) => onChange({ ...data, [k]: v })
  return (
    <>
      <Field label="Headline"><input style={inputStyle} value={data.headline || ''} onChange={(e) => set('headline', e.target.value)} /></Field>
      <Field label="Subheadline"><input style={inputStyle} value={data.subheadline || ''} onChange={(e) => set('subheadline', e.target.value)} /></Field>
      <Field label="CTA Text"><input style={inputStyle} value={data.cta?.text || ''} onChange={(e) => set('cta', { ...data.cta, text: e.target.value, url: data.cta?.url || '#' })} /></Field>
      <Field label="CTA URL"><input style={inputStyle} value={data.cta?.url || ''} onChange={(e) => set('cta', { ...data.cta, url: e.target.value, text: data.cta?.text || 'Get Started' })} /></Field>
    </>
  )
}

export function StatsSectionForm({ data, onChange }: FormProps<StatsData>) {
  const set = (k: keyof StatsData, v: unknown) => onChange({ ...data, [k]: v })
  const items = data.items || []
  return (
    <>
      <Field label="Heading"><input style={inputStyle} value={data.heading || ''} onChange={(e) => set('heading', e.target.value)} /></Field>
      <Field label="Stats">
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
            <input placeholder="Value (e.g. 10k)" style={{ ...inputStyle, flex: 1 }} value={item.value} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], value: e.target.value }; set('items', n) }} />
            <input placeholder="Label" style={{ ...inputStyle, flex: 1 }} value={item.label} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], label: e.target.value }; set('items', n) }} />
            <button type="button" onClick={() => set('items', items.filter((_, j) => j !== i))}
              style={{ padding: '4px 8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>×</button>
          </div>
        ))}
        <button type="button" onClick={() => set('items', [...items, { value: '', label: '' }])}
          style={{ fontSize: '0.75rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>+ Add Stat</button>
      </Field>
    </>
  )
}

export function HowItWorksSectionForm({ data, onChange }: FormProps<HowItWorksData>) {
  const set = (k: keyof HowItWorksData, v: unknown) => onChange({ ...data, [k]: v })
  const items = data.items || []
  return (
    <>
      <Field label="Heading"><input style={inputStyle} value={data.heading || ''} onChange={(e) => set('heading', e.target.value)} /></Field>
      <Field label="Steps">
        {items.map((item, i) => (
          <div key={i} style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.5rem' }}>
            <input placeholder="Step title" style={{ ...inputStyle, marginBottom: '4px' }} value={item.title} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], title: e.target.value }; set('items', n) }} />
            <textarea placeholder="Description" style={{ ...textareaStyle, minHeight: '50px' }} value={item.description} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], description: e.target.value }; set('items', n) }} />
            <button type="button" onClick={() => set('items', items.filter((_, j) => j !== i))}
              style={{ fontSize: '0.75rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={() => set('items', [...items, { title: '', description: '' }])}
          style={{ fontSize: '0.75rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>+ Add Step</button>
      </Field>
    </>
  )
}

export function TeamSectionForm({ data, onChange }: FormProps<TeamData>) {
  const set = (k: keyof TeamData, v: unknown) => onChange({ ...data, [k]: v })
  const members = data.members || []
  return (
    <>
      <Field label="Heading"><input style={inputStyle} value={data.heading || ''} onChange={(e) => set('heading', e.target.value)} /></Field>
      <Field label="Team Members">
        {members.map((m, i) => (
          <div key={i} style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.5rem' }}>
            <input placeholder="Name" style={{ ...inputStyle, marginBottom: '4px' }} value={m.name} onChange={(e) => { const n = [...members]; n[i] = { ...n[i], name: e.target.value }; set('members', n) }} />
            <input placeholder="Role" style={inputStyle} value={m.role} onChange={(e) => { const n = [...members]; n[i] = { ...n[i], role: e.target.value }; set('members', n) }} />
            <button type="button" onClick={() => set('members', members.filter((_, j) => j !== i))}
              style={{ fontSize: '0.75rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', marginTop: '4px' }}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={() => set('members', [...members, { name: '', role: '' }])}
          style={{ fontSize: '0.75rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>+ Add Member</button>
      </Field>
    </>
  )
}

export function LogoWallSectionForm({ data, onChange }: FormProps<LogoWallData>) {
  const set = (k: keyof LogoWallData, v: unknown) => onChange({ ...data, [k]: v })
  const logos = data.logos || []
  return (
    <>
      <Field label="Heading"><input style={inputStyle} value={data.heading || ''} onChange={(e) => set('heading', e.target.value)} /></Field>
      <ArrayField label="Logo Names" items={logos.map((l) => l.name)}
        onChange={(names) => set('logos', names.map((name, i) => ({ name, image: logos[i]?.image || '', url: logos[i]?.url })))} />
    </>
  )
}

/** Maps section type to its form component */
export const sectionFormMap: Record<string, React.ComponentType<FormProps<any>>> = {
  hero: HeroSectionForm,
  features: FeaturesSectionForm,
  pricing: PricingSectionForm,
  testimonials: TestimonialsSectionForm,
  faq: FaqSectionForm,
  cta: CtaSectionForm,
  stats: StatsSectionForm,
  'how-it-works': HowItWorksSectionForm,
  team: TeamSectionForm,
  'logo-wall': LogoWallSectionForm,
}
