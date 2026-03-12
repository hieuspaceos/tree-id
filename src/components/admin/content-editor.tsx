/**
 * Content editor — coordinator for two-column editor layout
 * Handles load/save logic, wraps EditorMainPanel + EditorSidebarPanel
 */
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'wouter'
import { api } from '@/lib/admin/api-client'
import { getSchemaForCollection, type FieldSchema } from '@/lib/admin/schema-registry'
import { useFormState } from '@/lib/admin/form-reducer'
import { EditorMainPanel } from './editor-main-panel'
import { EditorSidebarPanel } from './editor-sidebar-panel'
import { useToast } from './admin-toast'

interface Props {
  collection: string
  slug?: string
}

/** Fields shown in main panel vs sidebar — main panel gets title, content, and collection-specific fields */
const SIDEBAR_FIELDS = new Set([
  'title', 'description', 'summary', 'status', 'publishedAt',
  'tags', 'category', 'seo', 'cover', 'video', 'links',
])

/** Fields that are content areas (shown in main panel below slug) */
const CONTENT_FIELDS = new Set(['content'])

export function ContentEditor({ collection, slug }: Props) {
  const [, navigate] = useLocation()
  const toast = useToast()
  const schema = getSchemaForCollection(collection)
  const form = useFormState({})
  const saving = useRef(false)
  const isCreate = !slug
  const [editedSlug, setEditedSlug] = useState(slug || '')

  // Categorize fields into main panel extras (not title/content/sidebar)
  const contentField = schema.find((f) => CONTENT_FIELDS.has(f.name) && f.type === 'markdoc')
  const extraFields: FieldSchema[] = schema.filter(
    (f) => !SIDEBAR_FIELDS.has(f.name) && !CONTENT_FIELDS.has(f.name) && f.name !== 'title',
  )

  // Load entry in edit mode
  useEffect(() => {
    if (!slug) return
    api.collections.read(collection, slug).then((res) => {
      if (res.ok && res.data) {
        form.reset(res.data as Record<string, unknown>)
        setEditedSlug(slug)
      } else {
        toast.error('Failed to load entry')
      }
    })
  }, [collection, slug])

  // Unsaved changes warning
  useEffect(() => {
    if (!form.dirty) return
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [form.dirty])

  // Auto-save draft to localStorage every 30s
  useEffect(() => {
    if (!form.dirty) return
    const key = `admin-draft-${collection}-${slug || 'new'}`
    const timer = setInterval(() => {
      localStorage.setItem(key, JSON.stringify(form.values))
    }, 30_000)
    return () => clearInterval(timer)
  }, [form.dirty, form.values, collection, slug])

  // Load draft from localStorage on mount (create mode only)
  useEffect(() => {
    if (slug) return
    const key = `admin-draft-${collection}-new`
    const saved = localStorage.getItem(key)
    if (saved) {
      try {
        form.reset(JSON.parse(saved))
        toast.success('Draft restored')
      } catch { /* ignore invalid JSON */ }
    }
  }, [collection])

  async function handleSave() {
    if (saving.current) return
    saving.current = true

    // Basic validation
    const errors: Record<string, string> = {}
    for (const field of schema) {
      if (field.required && !form.values[field.name]) {
        errors[field.name] = `${field.label} is required`
      }
    }
    if (Object.keys(errors).some((k) => errors[k])) {
      form.setErrors(errors)
      saving.current = false
      return
    }

    try {
      const slugChanged = !isCreate && editedSlug && editedSlug !== slug

      if (isCreate) {
        // For create, include slug if user typed one
        const data = { ...form.values }
        if (editedSlug) (data as Record<string, unknown>).slug = editedSlug
        const res = await api.collections.create(collection, data)
        if (res.ok) {
          localStorage.removeItem(`admin-draft-${collection}-new`)
          toast.success('Created successfully')
          navigate(`/${collection}`)
        } else {
          toast.error(res.error || 'Create failed')
        }
      } else if (slugChanged) {
        // Slug changed — create new entry, delete old one
        const data = { ...form.values, slug: editedSlug }
        const createRes = await api.collections.create(collection, data)
        if (createRes.ok) {
          await api.collections.delete(collection, slug!)
          toast.success('Saved (slug renamed)')
          navigate(`/${collection}/${editedSlug}`)
        } else {
          toast.error(createRes.error || 'Rename failed')
        }
      } else {
        const res = await api.collections.update(collection, slug!, form.values)
        if (res.ok) {
          toast.success('Saved')
          form.reset(form.values)
        } else {
          toast.error(res.error || 'Save failed')
        }
      }
    } catch {
      toast.error('Network error')
    }
    saving.current = false
  }

  function handleObjectChange(parentName: string, childName: string, value: unknown) {
    const parent = (form.values[parentName] as Record<string, unknown>) || {}
    form.setField(parentName, { ...parent, [childName]: value })
  }

  const label = collection.charAt(0).toUpperCase() + collection.slice(1)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <button
          className="admin-btn admin-btn-ghost"
          onClick={() => navigate(`/${collection}`)}
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
        >
          ← Back to {label}
        </button>
      </div>

      {/* Two-column layout */}
      <form onSubmit={(e) => { e.preventDefault(); handleSave() }}>
        <div className="editor-two-col">
          <EditorMainPanel
            collection={collection}
            values={form.values}
            errors={form.errors}
            slug={slug}
            editedSlug={editedSlug}
            onSlugChange={setEditedSlug}
            onFieldChange={form.setField}
            contentField={contentField}
            extraFields={extraFields}
          />

          <EditorSidebarPanel
            collection={collection}
            values={form.values}
            errors={form.errors}
            dirty={form.dirty}
            isCreate={isCreate}
            slug={slug}
            onFieldChange={form.setField}
            onObjectChange={handleObjectChange}
            onSave={handleSave}
            onCancel={() => navigate(`/${collection}`)}
            onPreview={() => {
              const previewSlug = slug || editedSlug || (form.values.title as string || '').toLowerCase().replace(/\s+/g, '-')
              const basePath = collection === 'articles' ? 'seeds' : collection
              if (previewSlug) window.open(`/${basePath}/${previewSlug}`, '_blank')
            }}
          />
        </div>
      </form>
    </div>
  )
}
