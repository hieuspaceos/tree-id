/**
 * Searchable icon picker — emoji grid with filter.
 * Used in section forms for icon fields (features, how-it-works, social-proof, banner).
 */
import { useState } from 'react'

// Common icons organized by category
const ICONS: Array<{ emoji: string; label: string; tags: string[] }> = [
  // UI / General
  { emoji: '✨', label: 'Sparkles', tags: ['star', 'magic', 'new', 'feature'] },
  { emoji: '🚀', label: 'Rocket', tags: ['launch', 'fast', 'speed', 'startup'] },
  { emoji: '⚡', label: 'Lightning', tags: ['fast', 'power', 'energy', 'speed'] },
  { emoji: '🎯', label: 'Target', tags: ['goal', 'aim', 'focus', 'precision'] },
  { emoji: '💡', label: 'Lightbulb', tags: ['idea', 'tip', 'insight'] },
  { emoji: '🔒', label: 'Lock', tags: ['security', 'safe', 'private', 'auth'] },
  { emoji: '🔑', label: 'Key', tags: ['access', 'auth', 'password', 'login'] },
  { emoji: '📊', label: 'Chart', tags: ['analytics', 'data', 'stats', 'graph'] },
  { emoji: '📈', label: 'Trending Up', tags: ['growth', 'increase', 'profit'] },
  { emoji: '💰', label: 'Money', tags: ['price', 'cost', 'payment', 'revenue'] },
  { emoji: '🛡️', label: 'Shield', tags: ['protect', 'security', 'defense', 'safe'] },
  { emoji: '⚙️', label: 'Gear', tags: ['settings', 'config', 'tools', 'setup'] },
  { emoji: '🔧', label: 'Wrench', tags: ['fix', 'repair', 'tools', 'build'] },
  { emoji: '📦', label: 'Package', tags: ['box', 'ship', 'deliver', 'product'] },
  { emoji: '🎨', label: 'Palette', tags: ['design', 'art', 'color', 'creative'] },
  { emoji: '📱', label: 'Phone', tags: ['mobile', 'app', 'device'] },
  { emoji: '💻', label: 'Laptop', tags: ['computer', 'desktop', 'code', 'dev'] },
  { emoji: '🌐', label: 'Globe', tags: ['web', 'world', 'internet', 'global'] },
  { emoji: '☁️', label: 'Cloud', tags: ['hosting', 'server', 'saas', 'storage'] },
  { emoji: '📧', label: 'Email', tags: ['mail', 'message', 'contact', 'inbox'] },
  { emoji: '👥', label: 'People', tags: ['team', 'users', 'group', 'community'] },
  { emoji: '🏆', label: 'Trophy', tags: ['winner', 'award', 'best', 'top'] },
  { emoji: '❤️', label: 'Heart', tags: ['love', 'favorite', 'like', 'health'] },
  { emoji: '✅', label: 'Check', tags: ['done', 'complete', 'yes', 'success'] },
  { emoji: '❌', label: 'Cross', tags: ['no', 'remove', 'delete', 'cancel'] },
  { emoji: '⏱', label: 'Timer', tags: ['time', 'clock', 'countdown', 'fast'] },
  { emoji: '🔔', label: 'Bell', tags: ['notification', 'alert', 'reminder'] },
  { emoji: '📝', label: 'Note', tags: ['write', 'edit', 'document', 'content'] },
  { emoji: '🗂', label: 'Folder', tags: ['file', 'organize', 'category'] },
  { emoji: '🔗', label: 'Link', tags: ['url', 'connect', 'chain', 'href'] },
  // Social
  { emoji: '📘', label: 'Facebook', tags: ['facebook', 'fb', 'social', 'meta'] },
  { emoji: '🐦', label: 'Twitter/X', tags: ['twitter', 'x', 'social', 'tweet'] },
  { emoji: '📸', label: 'Instagram', tags: ['instagram', 'ig', 'photo', 'social'] },
  { emoji: '▶️', label: 'YouTube', tags: ['youtube', 'video', 'play', 'social'] },
  { emoji: '💼', label: 'LinkedIn', tags: ['linkedin', 'professional', 'social', 'business'] },
  { emoji: '💬', label: 'Discord', tags: ['discord', 'chat', 'community', 'social'] },
  { emoji: '🐙', label: 'GitHub', tags: ['github', 'code', 'opensource', 'git'] },
  // Arrows / Navigation
  { emoji: '→', label: 'Arrow Right', tags: ['next', 'forward', 'go'] },
  { emoji: '←', label: 'Arrow Left', tags: ['back', 'previous', 'return'] },
  { emoji: '↑', label: 'Arrow Up', tags: ['up', 'increase', 'top'] },
  { emoji: '↓', label: 'Arrow Down', tags: ['down', 'decrease', 'bottom'] },
]

interface Props {
  value: string
  onChange: (icon: string) => void
  placeholder?: string
}

export function IconPicker({ value, onChange, placeholder }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = search
    ? ICONS.filter(ic =>
        ic.label.toLowerCase().includes(search.toLowerCase()) ||
        ic.tags.some(t => t.includes(search.toLowerCase()))
      )
    : ICONS

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          style={{
            width: '36px', height: '36px', fontSize: '1.2rem', border: '1px solid #d1d5db',
            borderRadius: '6px', background: '#fff', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}
        >{value || '+'}</button>
        <input
          style={{
            flex: 1, padding: '0.4rem 0.6rem', border: '1px solid #d1d5db',
            borderRadius: '6px', fontSize: '0.8rem',
          }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'Icon or emoji'}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            style={{ padding: '2px 6px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}
          >✕</button>
        )}
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: '40px', left: 0, zIndex: 50, width: '280px',
          background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: '0.5rem',
        }}>
          <input
            autoFocus
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #e2e8f0',
              borderRadius: '6px', fontSize: '0.8rem', marginBottom: '0.5rem',
              boxSizing: 'border-box',
            }}
          />
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '2px',
            maxHeight: '200px', overflowY: 'auto',
          }}>
            {filtered.map((ic) => (
              <button
                key={ic.emoji}
                type="button"
                title={ic.label}
                onClick={() => { onChange(ic.emoji); setOpen(false); setSearch('') }}
                style={{
                  width: '32px', height: '32px', fontSize: '1.1rem', border: 'none',
                  background: value === ic.emoji ? '#dbeafe' : 'transparent',
                  borderRadius: '4px', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >{ic.emoji}</button>
            ))}
          </div>
          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', padding: '0.5rem' }}>No icons found</p>
          )}
        </div>
      )}
    </div>
  )
}
