/**
 * Reusable image field component for landing page section forms.
 * Combines URL input + thumbnail preview + drag-drop upload + file picker.
 * Gracefully falls back to URL-only mode when R2 storage is not configured.
 */
import { useState, useRef } from 'react'

interface Props {
  value: string
  onChange: (url: string) => void
  placeholder?: string
  uploadPath?: string   // R2 subdirectory, default: 'landing'
  previewSize?: number  // thumbnail px, default: 48
  compact?: boolean     // smaller layout for inline use (avatars, logos)
}

export function ImageField({ value, onChange, placeholder, uploadPath = 'landing', previewSize = 48, compact = false }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hasPreview = value && (value.startsWith('http') || value.startsWith('/') || value.startsWith('data:'))
  const thumbSize = compact ? Math.min(previewSize, 32) : previewSize

  function showError(msg: string) {
    setError(msg)
    if (errorTimer.current) clearTimeout(errorTimer.current)
    errorTimer.current = setTimeout(() => setError(''), 4000)
  }

  async function uploadFile(file: File) {
    if (!file.type.startsWith('image/')) { showError('Only image files allowed.'); return }
    if (file.size > 4 * 1024 * 1024) { showError('Max file size is 4MB.'); return }

    setUploading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('path', uploadPath)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
      if (res.status === 503) { showError('Storage not configured. Paste a URL instead.'); return }
      if (!res.ok) { showError('Upload failed. Try pasting a URL instead.'); return }
      const data = await res.json()
      if (data.url) onChange(data.url)
      else showError('Upload succeeded but no URL returned.')
    } catch {
      showError('Upload failed. Check your connection.')
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
    // Reset so same file can be re-selected
    e.target.value = ''
  }

  const inputStyle = {
    flex: 1,
    padding: compact ? '3px 7px' : '5px 9px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontSize: compact ? '0.75rem' : '0.82rem',
    background: 'white',
    minWidth: 0,
  }

  const uploadBtnStyle = {
    padding: compact ? '3px 7px' : '5px 9px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    background: uploading ? '#f1f5f9' : 'white',
    color: '#475569',
    cursor: uploading ? 'not-allowed' : 'pointer',
    fontSize: '0.75rem',
    flexShrink: 0,
    whiteSpace: 'nowrap' as const,
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragEnter={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      style={{
        border: dragOver ? '2px dashed #3b82f6' : '2px dashed transparent',
        borderRadius: '8px',
        padding: dragOver ? '4px' : '0',
        transition: 'all 0.15s',
        background: dragOver ? '#eff6ff' : 'transparent',
      }}
    >
      {/* Main row: preview + URL input + upload button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        {/* Thumbnail preview */}
        {hasPreview && (
          <img
            src={value}
            alt=""
            onError={(e) => { e.currentTarget.style.display = 'none' }}
            style={{
              width: `${thumbSize}px`,
              height: `${thumbSize}px`,
              objectFit: 'cover',
              borderRadius: '6px',
              flexShrink: 0,
              border: '1px solid #e2e8f0',
            }}
          />
        )}

        {/* URL input */}
        <input
          style={inputStyle}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'https://...'}
        />

        {/* Upload button */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={uploadBtnStyle}
          title="Upload image file"
        >
          {uploading ? '⏳' : '📁'}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.7rem', color: '#dc2626' }}>{error}</p>
      )}

      {/* Drag hint — shown when no value or dragging */}
      {(!value || dragOver) && !compact && (
        <p style={{
          margin: '0.3rem 0 0',
          fontSize: '0.65rem',
          color: dragOver ? '#3b82f6' : '#94a3b8',
          textAlign: 'center',
        }}>
          {dragOver ? 'Drop to upload' : 'Drop image here or click 📁 to upload · Max 4MB'}
        </p>
      )}

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  )
}
