/**
 * Drag-and-drop file upload for CodeMirror 6
 * Drops image files onto editor, uploads to /api/admin/upload, inserts markdown
 */
import { EditorView } from '@codemirror/view'

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']
const MAX_SIZE = 4.5 * 1024 * 1024 // 4.5MB Vercel limit

/** Upload a file to the admin upload endpoint */
async function uploadFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
  const data = await res.json()
  return data.url
}

/** Get document position at drop coordinates */
function getDropPos(view: EditorView, event: DragEvent): number {
  return view.posAtCoords({ x: event.clientX, y: event.clientY }) ?? view.state.selection.main.head
}

/** Extension enabling drag-and-drop image upload into the editor */
export const dragDropExtension = EditorView.domEventHandlers({
  dragover: (event) => {
    event.preventDefault()
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
    return true
  },

  drop: (event, view) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer?.files || [])
    const images = files.filter(f => ALLOWED_TYPES.includes(f.type) && f.size <= MAX_SIZE)

    if (images.length === 0) return false

    const dropPos = getDropPos(view, event)
    const placeholder = '![Uploading...]()'

    // Insert placeholders at drop position
    view.dispatch({
      changes: { from: dropPos, insert: '\n' + images.map(() => placeholder).join('\n') + '\n' },
    })

    // Upload each file and replace its placeholder
    images.forEach(async (file) => {
      try {
        const url = await uploadFile(file)
        const doc = view.state.doc.toString()
        const idx = doc.indexOf(placeholder)
        if (idx >= 0) {
          const name = file.name.replace(/\.[^.]+$/, '')
          view.dispatch({
            changes: { from: idx, to: idx + placeholder.length, insert: `![${name}](${url})` },
          })
        }
      } catch (err) {
        console.error('Upload failed:', err)
        const doc = view.state.doc.toString()
        const idx = doc.indexOf(placeholder)
        if (idx >= 0) {
          view.dispatch({
            changes: { from: idx, to: idx + placeholder.length, insert: `<!-- Upload failed: ${file.name} -->` },
          })
        }
      }
    })

    return true
  },
})
