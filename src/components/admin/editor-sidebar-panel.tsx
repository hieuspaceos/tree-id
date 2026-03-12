/**
 * Editor sidebar panel — right column with glass panel boxes
 * Publish, Category, Tags, Featured Image, SEO (collapsible)
 */
import { useState } from 'react'
import { EditorFeaturedImage } from './editor-featured-image'
import { renderField } from './field-renderers/render-field'
import { getSchemaForCollection, type FieldSchema } from '@/lib/admin/schema-registry'

interface Props {
  collection: string
  values: Record<string, unknown>
  errors: Record<string, string>
  dirty: boolean
  isCreate: boolean
  slug?: string
  onFieldChange: (name: string, value: unknown) => void
  onObjectChange: (parentName: string, childName: string, value: unknown) => void
  onSave: () => void
  onCancel: () => void
  onPreview: () => void
}

/** Find a field schema by name from the collection schema */
function findField(collection: string, name: string): FieldSchema | undefined {
  return getSchemaForCollection(collection).find((f) => f.name === name)
}

export function EditorSidebarPanel({
  collection,
  values,
  errors,
  dirty,
  isCreate,
  slug,
  onFieldChange,
  onObjectChange,
  onSave,
  onCancel,
  onPreview,
}: Props) {
  const [seoOpen, setSeoOpen] = useState(false)
  const [videoOpen, setVideoOpen] = useState(false)
  const [linksOpen, setLinksOpen] = useState(false)

  const cover = (values.cover as Record<string, string> | null | undefined) ?? {}
  const seo = (values.seo as Record<string, unknown>) || {}
  const video = (values.video as Record<string, unknown>) || {}
  const links = (values.links as Record<string, unknown>) || {}

  const statusField = findField(collection, 'status')
  const dateField = findField(collection, 'publishedAt')
  const categoryField = findField(collection, 'category')
  const tagsField = findField(collection, 'tags')
  const descField = findField(collection, 'description')
  const summaryField = findField(collection, 'summary')
  const seoSchema = findField(collection, 'seo')
  const videoSchema = findField(collection, 'video')
  const linksSchema = findField(collection, 'links')

  return (
    <div className="editor-sidebar-panel">
      {/* Publish box */}
      <div className="editor-panel-box">
        <div className="editor-panel-box-title">Publish</div>
        {statusField && renderField(statusField, values.status, (v) => onFieldChange('status', v), false, errors.status)}
        {dateField && renderField(dateField, values.publishedAt, (v) => onFieldChange('publishedAt', v), false, errors.publishedAt)}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          {dirty && (
            <span style={{ fontSize: '0.75rem', color: '#f59e0b', alignSelf: 'center', marginRight: 'auto' }}>
              Unsaved
            </span>
          )}
          <button type="button" className="admin-btn admin-btn-ghost" onClick={onCancel} style={{ fontSize: '0.8rem', padding: '0.375rem 0.75rem' }}>
            Cancel
          </button>
          {!isCreate && slug && (
            <button type="button" className="admin-btn admin-btn-ghost" onClick={onPreview} style={{ fontSize: '0.8rem', padding: '0.375rem 0.75rem' }}>
              Preview
            </button>
          )}
          <button type="submit" className="admin-btn admin-btn-primary" onClick={onSave} style={{ fontSize: '0.8rem', padding: '0.375rem 0.75rem' }}>
            {isCreate ? 'Create' : 'Save'}
          </button>
        </div>
      </div>

      {/* Description + Summary */}
      <div className="editor-panel-box">
        <div className="editor-panel-box-title">Description</div>
        {descField && renderField(descField, values.description, (v) => onFieldChange('description', v), false, errors.description)}
        {summaryField && renderField(summaryField, values.summary, (v) => onFieldChange('summary', v), false, errors.summary)}
      </div>

      {/* Category */}
      {categoryField && (
        <div className="editor-panel-box">
          <div className="editor-panel-box-title">Category</div>
          {renderField(categoryField, values.category, (v) => onFieldChange('category', v), false, errors.category)}
        </div>
      )}

      {/* Tags */}
      {tagsField && (
        <div className="editor-panel-box">
          <div className="editor-panel-box-title">Tags</div>
          {renderField(tagsField, values.tags, (v) => onFieldChange('tags', v), false, errors.tags)}
        </div>
      )}

      {/* Featured Image */}
      <div className="editor-panel-box">
        <div className="editor-panel-box-title">Featured Image</div>
        <EditorFeaturedImage
          coverUrl={cover.url || ''}
          coverAlt={cover.alt || ''}
          onCoverChange={(url, alt) => onFieldChange('cover', { url, alt })}
        />
      </div>

      {/* SEO (collapsible) */}
      {seoSchema && (
        <div className="editor-panel-box">
          <div className="editor-collapsible-header" onClick={() => setSeoOpen(!seoOpen)}>
            <span className="editor-panel-box-title" style={{ marginBottom: 0 }}>SEO</span>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', transform: seoOpen ? 'rotate(90deg)' : 'none', transition: 'transform 150ms' }}>▶</span>
          </div>
          {seoOpen && seoSchema.fields && (
            <div style={{ marginTop: '0.75rem' }}>
              {seoSchema.fields.map((f) =>
                renderField(f, seo[f.name], (v) => onObjectChange('seo', f.name, v), false, errors[`seo.${f.name}`]),
              )}
            </div>
          )}
        </div>
      )}

      {/* Video (collapsible) */}
      {videoSchema && (
        <div className="editor-panel-box">
          <div className="editor-collapsible-header" onClick={() => setVideoOpen(!videoOpen)}>
            <span className="editor-panel-box-title" style={{ marginBottom: 0 }}>Video Factory</span>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', transform: videoOpen ? 'rotate(90deg)' : 'none', transition: 'transform 150ms' }}>▶</span>
          </div>
          {videoOpen && videoSchema.fields && (
            <div style={{ marginTop: '0.75rem' }}>
              {videoSchema.fields.map((f) =>
                renderField(f, video[f.name], (v) => onObjectChange('video', f.name, v), false, errors[`video.${f.name}`]),
              )}
            </div>
          )}
        </div>
      )}

      {/* Links (collapsible) */}
      {linksSchema && (
        <div className="editor-panel-box">
          <div className="editor-collapsible-header" onClick={() => setLinksOpen(!linksOpen)}>
            <span className="editor-panel-box-title" style={{ marginBottom: 0 }}>Links</span>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', transform: linksOpen ? 'rotate(90deg)' : 'none', transition: 'transform 150ms' }}>▶</span>
          </div>
          {linksOpen && linksSchema.fields && (
            <div style={{ marginTop: '0.75rem' }}>
              {linksSchema.fields.map((f) =>
                renderField(f, links[f.name], (v) => onObjectChange('links', f.name, v), false, errors[`links.${f.name}`]),
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
