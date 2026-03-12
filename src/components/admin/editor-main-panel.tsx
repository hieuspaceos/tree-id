/**
 * Editor main panel — left column: title, slug, content
 * Used inside ContentEditor two-column layout
 */
import { lazy, Suspense } from 'react'
import type { FieldSchema } from '@/lib/admin/schema-registry'
import { renderField } from './field-renderers/render-field'

const MarkdocEditor = lazy(() => import('./field-renderers/markdoc-editor'))

interface Props {
  collection: string
  values: Record<string, unknown>
  errors: Record<string, string>
  slug?: string
  editedSlug: string
  onSlugChange: (slug: string) => void
  onFieldChange: (name: string, value: unknown) => void
  contentField?: FieldSchema
  extraFields: FieldSchema[]
}

export function EditorMainPanel({
  collection,
  values,
  errors,
  slug,
  editedSlug,
  onSlugChange,
  onFieldChange,
  contentField,
  extraFields,
}: Props) {
  const collectionPath = collection === 'articles' ? 'seeds' : collection

  return (
    <div className="editor-main-panel">
      {/* Title — large input, no label */}
      <input
        type="text"
        className="editor-title-input"
        placeholder="Enter title..."
        value={(values.title as string) || ''}
        onChange={(e) => onFieldChange('title', e.target.value)}
      />
      {errors.title && <p className="admin-field-error">{errors.title}</p>}

      {/* Slug row */}
      <div className="editor-slug-row">
        <span className="slug-prefix">/{collectionPath}/</span>
        <input
          type="text"
          className="editor-slug-input"
          value={editedSlug}
          onChange={(e) => onSlugChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
          placeholder={slug ? slug : 'auto-generated-from-title'}
        />
      </div>

      {/* Extra collection-specific fields (e.g. recordType for records, content textarea for notes) */}
      {extraFields.map((field) =>
        renderField(
          field,
          values[field.name],
          (v) => onFieldChange(field.name, v),
          false,
          errors[field.name],
        ),
      )}

      {/* Markdoc content (articles only) */}
      {contentField && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <label className="admin-field-label">
            Content
            <span style={{ color: '#94a3b8', fontWeight: 400, marginLeft: '0.5rem' }}>(Markdown)</span>
          </label>
          <Suspense
            fallback={
              <textarea
                value={(values.content as string) || ''}
                onChange={(e) => onFieldChange('content', e.target.value)}
                className="glass-input admin-field-input"
                rows={16}
                placeholder="Loading editor..."
                style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.8125rem', resize: 'vertical', minHeight: '300px' }}
              />
            }
          >
            <MarkdocEditor value={(values.content as string) || ''} onChange={(v) => onFieldChange('content', v)} />
          </Suspense>
          {errors.content && <p className="admin-field-error">{errors.content}</p>}
        </div>
      )}
    </div>
  )
}
