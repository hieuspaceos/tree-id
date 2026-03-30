/**
 * Small "?" icon that shows a tooltip popup on click.
 * Works on desktop (hover/click) and mobile (tap).
 * Auto-positions above or below based on viewport space.
 * Closes on outside click.
 */
import { useState, useRef, useEffect } from 'react'

interface Props {
  text: string
}

export function HelpTip({ text }: Props) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, above: true })
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    function handleMouseDown(e: MouseEvent) {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [open])

  function handleToggle() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      const above = rect.top > 120
      setPos({
        top: above ? rect.top - 8 : rect.bottom + 8,
        left: Math.min(rect.left, window.innerWidth - 240),
        above,
      })
    }
    setOpen((o) => !o)
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={handleToggle}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: open ? '#e0e7ff' : '#f1f5f9',
          color: open ? '#4f46e5' : '#64748b',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.6rem',
          fontWeight: 700,
          flexShrink: 0,
          lineHeight: 1,
        }}
        title="Help"
      >?</button>

      {open && (
        <div
          style={{
            position: 'fixed',
            top: pos.above ? undefined : pos.top,
            bottom: pos.above ? window.innerHeight - pos.top : undefined,
            left: pos.left,
            zIndex: 100,
            maxWidth: '220px',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '0.55rem 0.7rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            fontSize: '0.72rem',
            color: '#475569',
            lineHeight: 1.5,
            pointerEvents: 'none',
          }}
        >
          {text}
        </div>
      )}
    </>
  )
}
