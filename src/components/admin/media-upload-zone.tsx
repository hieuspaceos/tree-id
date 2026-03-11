/**
 * Drag-and-drop upload zone — accepts images, videos, PDFs (max 4MB)
 * Shows upload progress and validates client-side before sending
 */
import { useState, useRef, useCallback } from 'react'
import { api } from '@/lib/admin/api-client'
import { useToast } from './admin-toast'

const MAX_SIZE = 4 * 1024 * 1024
const ALLOWED_TYPES = ['image/', 'video/', 'application/pdf']

interface Props {
  onUploaded: () => void
}

export function MediaUploadZone({ onUploaded }: Props) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  const validate = useCallback((file: File) => {
    if (!ALLOWED_TYPES.some((t) => file.type.startsWith(t))) {
      toast.error(`${file.name}: type not allowed`)
      return false
    }
    if (file.size > MAX_SIZE) {
      toast.error(`${file.name}: exceeds 4MB limit`)
      return false
    }
    return true
  }, [toast])

  async function uploadFiles(files: FileList | File[]) {
    const valid = Array.from(files).filter(validate)
    if (!valid.length) return

    setUploading(true)
    let succeeded = 0
    for (let i = 0; i < valid.length; i++) {
      setProgress(`Uploading ${i + 1}/${valid.length}: ${valid[i].name}`)
      const res = await api.upload(valid[i], 'shared')
      if (res.ok) succeeded++
      else toast.error(`Failed: ${valid[i].name}`)
    }
    setUploading(false)
    setProgress('')
    if (succeeded > 0) toast.success(`${succeeded} file(s) uploaded`)
    onUploaded()
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files)
  }

  return (
    <div
      className={`media-upload-zone ${dragging ? 'dragging' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !uploading && inputRef.current?.click()}
      style={{ cursor: uploading ? 'wait' : 'pointer' }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*,.pdf"
        style={{ display: 'none' }}
        onChange={(e) => e.target.files && uploadFiles(e.target.files)}
      />
      {uploading ? (
        <p style={{ color: '#3b82f6', fontSize: '0.85rem', fontWeight: 500 }}>{progress}</p>
      ) : (
        <>
          <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
            Drop files here or click to upload
          </p>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Images, videos, PDF — max 4MB each
          </p>
        </>
      )}
    </div>
  )
}
