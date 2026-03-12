/**
 * Featured image panel — thumbnail preview + Change/Remove buttons
 * Or dashed empty zone with Browse Library button
 */
import { useState } from 'react'
import { MediaBrowser } from './media-browser'

interface Props {
  coverUrl: string
  coverAlt: string
  onCoverChange: (url: string, alt: string) => void
}

export function EditorFeaturedImage({ coverUrl, coverAlt, onCoverChange }: Props) {
  const [showMedia, setShowMedia] = useState(false)

  if (coverUrl) {
    return (
      <div>
        <div className="editor-featured-image-preview">
          <img src={coverUrl} alt={coverAlt || 'Cover'} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="admin-btn admin-btn-ghost"
            style={{ flex: 1, fontSize: '0.75rem', padding: '0.375rem' }}
            onClick={() => setShowMedia(true)}
          >
            Change
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-danger"
            style={{ flex: 1, fontSize: '0.75rem', padding: '0.375rem' }}
            onClick={() => onCoverChange('', '')}
          >
            Remove
          </button>
        </div>
        {showMedia && (
          <MediaBrowser
            mode="dialog"
            onSelect={(url) => { onCoverChange(url, coverAlt); setShowMedia(false) }}
            onClose={() => setShowMedia(false)}
          />
        )}
      </div>
    )
  }

  return (
    <>
      <div
        className="editor-featured-image-empty"
        onClick={() => setShowMedia(true)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 0.375rem', display: 'block', opacity: 0.5 }}>
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        Browse Library
      </div>
      {showMedia && (
        <MediaBrowser
          mode="dialog"
          onSelect={(url) => { onCoverChange(url, coverAlt); setShowMedia(false) }}
          onClose={() => setShowMedia(false)}
        />
      )}
    </>
  )
}
