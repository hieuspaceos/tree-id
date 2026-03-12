/**
 * CodeMirror 6 glass morphism theme — matches admin dashboard design
 * Uses CSS vars from admin theme tokens for automatic consistency
 */
import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'

/** Structural theme — editor chrome (cursor, gutter, selection, panels) */
const glassTheme = EditorView.theme({
  '&': {
    backgroundColor: 'transparent',
    color: '#1e293b',
  },
  '.cm-content': {
    caretColor: 'var(--t-accent, #3b82f6)',
    padding: '1rem 1.25rem',
    fontFamily: 'ui-monospace, "Cascadia Code", "Fira Code", monospace',
    fontSize: '0.8125rem',
    lineHeight: '1.6',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'var(--t-accent, #3b82f6)',
    borderLeftWidth: '2px',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    background: 'var(--t-accent-soft, rgba(59,130,246,0.12))',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  '.cm-gutters': {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    color: '#94a3b8',
    border: 'none',
    borderRight: '1px solid var(--t-glass-border, rgba(0,0,0,0.08))',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    color: '#64748b',
  },
  '.cm-foldPlaceholder': {
    backgroundColor: 'var(--t-accent-soft, rgba(59,130,246,0.08))',
    border: 'none',
    color: 'var(--t-accent, #3b82f6)',
  },
  '&.cm-focused': {
    outline: 'none',
  },
  '.cm-matchingBracket': {
    backgroundColor: 'var(--t-accent-soft, rgba(59,130,246,0.15))',
    outline: '1px solid var(--t-accent, #3b82f6)',
  },
  '.cm-placeholder': {
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  /* Search panel — glass style */
  '.cm-panels': {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(8px)',
    borderBottom: '1px solid var(--t-glass-border)',
  },
  '.cm-panels .cm-button': {
    background: 'var(--t-accent-soft)',
    color: 'var(--t-accent)',
    border: 'none',
    borderRadius: '6px',
  },
  '.cm-searchMatch': {
    backgroundColor: 'rgba(250, 204, 21, 0.3)',
    borderRadius: '2px',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: 'rgba(250, 204, 21, 0.5)',
  },
  /* Fold gutter */
  '.cm-foldGutter .cm-gutterElement': {
    cursor: 'pointer',
    color: '#94a3b8',
    fontSize: '0.75rem',
  },
  '.cm-foldGutter .cm-gutterElement:hover': {
    color: 'var(--t-accent)',
  },
  /* Search panel inputs */
  '.cm-panel.cm-search': {
    padding: '8px 12px',
  },
  '.cm-panel.cm-search input': {
    background: 'rgba(255, 255, 255, 0.7)',
    border: '1px solid var(--t-glass-border)',
    borderRadius: '6px',
    padding: '4px 8px',
    fontSize: '0.8125rem',
    outline: 'none',
  },
  '.cm-panel.cm-search input:focus': {
    borderColor: 'var(--t-accent)',
    boxShadow: '0 0 0 2px var(--t-accent-soft)',
  },
  '.cm-panel.cm-search label': {
    fontSize: '0.75rem',
    color: '#64748b',
  },
})

/** Syntax highlighting — Markdown token colors */
const glassHighlight = HighlightStyle.define([
  { tag: tags.heading1, fontWeight: '700', fontSize: '1.3em', color: '#0f172a' },
  { tag: tags.heading2, fontWeight: '700', fontSize: '1.15em', color: '#1e293b' },
  { tag: tags.heading3, fontWeight: '600', fontSize: '1.05em', color: '#334155' },
  { tag: tags.heading4, fontWeight: '600', color: '#475569' },
  { tag: tags.strong, fontWeight: '700' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strikethrough, textDecoration: 'line-through', color: '#94a3b8' },
  { tag: tags.link, color: 'var(--t-accent, #3b82f6)', textDecoration: 'underline' },
  { tag: tags.url, color: '#64748b', textDecoration: 'underline' },
  {
    tag: tags.monospace,
    fontFamily: 'ui-monospace, monospace',
    backgroundColor: 'var(--t-accent-soft, rgba(59,130,246,0.08))',
    borderRadius: '3px',
    padding: '1px 4px',
  },
  { tag: tags.quote, color: '#64748b', fontStyle: 'italic' },
  { tag: tags.list, color: 'var(--t-accent, #3b82f6)' },
  { tag: tags.contentSeparator, color: '#cbd5e1' },
  { tag: tags.processingInstruction, color: '#7c3aed' },
  { tag: tags.meta, color: '#94a3b8' },
  /* Code block token colors (for fenced code blocks with language) */
  { tag: tags.keyword, color: '#7c3aed' },
  { tag: tags.string, color: '#059669' },
  { tag: tags.number, color: '#d97706' },
  { tag: tags.comment, color: '#94a3b8', fontStyle: 'italic' },
  { tag: tags.function(tags.variableName), color: '#2563eb' },
  { tag: tags.operator, color: '#be185d' },
  { tag: tags.className, color: '#7c3aed' },
  { tag: tags.typeName, color: '#0891b2' },
  { tag: tags.bool, color: '#d97706' },
  { tag: tags.propertyName, color: '#0369a1' },
])

/** Combined extension — import this in markdoc-editor.tsx */
export const glassThemeExtension = [
  glassTheme,
  syntaxHighlighting(glassHighlight),
]
