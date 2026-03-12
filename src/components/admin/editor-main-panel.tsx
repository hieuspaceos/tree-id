/**
 * Editor main panel — left column: title, slug, content, then metadata fields below
 * Fields below content are grouped into flex rows for compact layout
 */
import { lazy, Suspense } from 'react'
import type { FieldSchema } from '@/lib/admin/schema-registry'
import { EditorFeaturedImage } from './editor-featured-image'
import { renderField } from './field-renderers/render-field'

const MarkdocEditor = lazy(() => import('./field-renderers/markdoc-editor'))

/** Fields grouped into flex rows below content */
const FLEX_GROUPS: string[][] = [
  ['description', 'summary'],
  ['tags', 'category'],
  ['cover', 'video', 'links'],
]

/** All fields handled by flex groups */
const GROUPED_FIELDS = new Set(FLEX_GROUPS.flat())

interface Props {
  collection: string
  values: Record<string, unknown>
  errors: Record<string, string>
  slug?: string
  editedSlug: string
  onSlugChange: (slug: string) => void
  onFieldChange: (name: string, value: unknown) => void
  onObjectChange: (parentName: string, childName: string, value: unknown) => void
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
  onObjectChange,
  contentField,
  extraFields,
}: Props) {
  const collectionPath = collection === 'articles' ? 'seeds' : collection
  const cover = (values.cover as Record<string, string> | null) ?? {}

  // Fields not in any flex group (e.g. recordType, recordData)
  const ungroupedFields = extraFields.filter((f) => !GROUPED_FIELDS.has(f.name))

  // Resolve field schemas from extraFields by name
  const fieldMap = new Map(extraFields.map((f) => [f.name, f]))

  return (
    <div className="editor-main-panel">
      {/* Title */}
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

      {/* Ungrouped collection-specific fields (recordType, recordData, etc.) */}
      {ungroupedFields.map((field) =>
        renderField(field, values[field.name], (v) => onFieldChange(field.name, v), false, errors[field.name]),
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

      {/* Grouped metadata fields below content — glass panel wrapper */}
      {extraFields.some((f) => GROUPED_FIELDS.has(f.name)) && (
      <div className="editor-panel-box" style={{ marginTop: '1rem' }}>
        <div className="editor-panel-box-title">Metadata</div>
      {FLEX_GROUPS.map((group, gi) => {
        // Only render groups that have at least one field in extraFields
        const fields = group.map((name) => fieldMap.get(name)).filter(Boolean) as FieldSchema[]
        if (fields.length === 0) return null

        return (
          <div key={gi} className="editor-field-row">
            {fields.map((field) => {
              // Special rendering for cover image
              if (field.name === 'cover') {
                return (
                  <div key={field.name} className="editor-field-row-item">
                    <label className="admin-field-label">Featured Image</label>
                    <EditorFeaturedImage
                      coverUrl={cover.url || ''}
                      coverAlt={cover.alt || ''}
                      onCoverChange={(url, alt) => onFieldChange('cover', { url, alt })}
                    />
                  </div>
                )
              }

              // Object fields (video, links) use onObjectChange
              if (field.type === 'object' && field.fields) {
                const obj = (values[field.name] as Record<string, unknown>) || {}
                return (
                  <div key={field.name} className="editor-field-row-item">
                    <label className="admin-field-label">{field.label}</label>
                    {field.fields.map((sub) =>
                      renderField(sub, obj[sub.name], (v) => onObjectChange(field.name, sub.name, v), false, errors[`${field.name}.${sub.name}`]),
                    )}
                  </div>
                )
              }

              // Standard fields (description, summary, tags, category)
              return (
                <div key={field.name} className="editor-field-row-item">
                  {renderField(field, values[field.name], (v) => onFieldChange(field.name, v), false, errors[field.name])}
                </div>
              )
            })}
          </div>
        )
      })}
      </div>
      )}
    </div>
  )
}
