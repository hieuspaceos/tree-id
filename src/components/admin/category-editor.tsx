/**
 * Category editor — create/edit form for categories
 * Fields: name, description, color (native color picker)
 */
import { useEffect, useRef } from 'react'
import { useLocation } from 'wouter'
import { api } from '@/lib/admin/api-client'
import { getSchemaForCollection } from '@/lib/admin/schema-registry'
import { useFormState } from '@/lib/admin/form-reducer'
import { renderField } from './field-renderers/render-field'
import { useToast } from './admin-toast'

interface Props {
  slug?: string
}

export function CategoryEditor({ slug }: Props) {
  const [, navigate] = useLocation()
  const toast = useToast()
  const schema = getSchemaForCollection('categories')
  const form = useFormState({ color: '#6366f1' })
  const saving = useRef(false)
  const isCreate = !slug

  useEffect(() => {
    if (!slug) return
    api.collections.read('categories', slug).then((res) => {
      if (res.ok && res.data) form.reset(res.data as Record<string, unknown>)
      else toast.error('Failed to load category')
    })
  }, [slug])

  async function handleSave() {
    if (saving.current) return
    saving.current = true

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
      // Categories use 'name' as the title field for slug generation
      const data = { ...form.values, title: form.values.name }

      if (isCreate) {
        const res = await api.collections.create('categories', data)
        if (res.ok) {
          toast.success('Category created')
          navigate('/categories')
        } else {
          toast.error(res.error || 'Create failed')
        }
      } else {
        const res = await api.collections.update('categories', slug, data)
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <button
            className="admin-btn admin-btn-ghost"
            onClick={() => navigate('/categories')}
            style={{ marginBottom: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
          >
            ← Back to Categories
          </button>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
            {isCreate ? 'New Category' : (form.values.name as string) || 'Edit Category'}
          </h1>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '14px', maxWidth: '600px' }}>
        <form onSubmit={(e) => { e.preventDefault(); handleSave() }}>
          {schema.map((field) =>
            renderField(field, form.values[field.name], (v) => form.setField(field.name, v), false, form.errors[field.name]),
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--t-glass-border)' }}>
            {form.dirty && (
              <span style={{ fontSize: '0.8rem', color: '#f59e0b', alignSelf: 'center', marginRight: 'auto' }}>
                Unsaved changes
              </span>
            )}
            <button type="button" className="admin-btn admin-btn-ghost" onClick={() => navigate('/categories')}>
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn-primary">
              {isCreate ? 'Create' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
