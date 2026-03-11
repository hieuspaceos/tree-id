/**
 * Keyboard shortcuts modal — opened with "?" key
 * Lists all available shortcuts in the admin SPA
 */

interface Props {
  onClose: () => void
}

const shortcuts = [
  { key: '?', desc: 'Show keyboard shortcuts' },
  { key: 'Ctrl+S', desc: 'Save current form' },
  { key: 'Ctrl+N', desc: 'New entry' },
  { key: 'Escape', desc: 'Close dialog / modal' },
  { key: 'Ctrl+B', desc: 'Bold (in editor)' },
  { key: 'Ctrl+I', desc: 'Italic (in editor)' },
  { key: 'Ctrl+K', desc: 'Insert link (in editor)' },
]

export function KeyboardShortcuts({ onClose }: Props) {
  return (
    <div className="shortcuts-backdrop" onClick={onClose}>
      <div className="shortcuts-modal glass-panel" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>Keyboard Shortcuts</h2>
          <button type="button" className="admin-btn admin-btn-ghost" onClick={onClose} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
            Close
          </button>
        </div>
        <div>
          {shortcuts.map(({ key, desc }) => (
            <div key={key} className="shortcut-row">
              <span>{desc}</span>
              <span className="shortcut-key">{key}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
