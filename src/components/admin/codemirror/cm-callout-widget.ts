/**
 * Callout block styling for CodeMirror 6
 * Detects Obsidian-style callouts: > [!type] Title
 * Applies type-specific CSS classes for colored left border + background
 */
import { ViewPlugin, type ViewUpdate, Decoration, type DecorationSet } from '@codemirror/view'
import { RangeSetBuilder, type EditorState } from '@codemirror/state'

/** Callout type -> CSS class mapping */
const CALLOUT_TYPES: Record<string, string> = {
  note: 'cm-callout-note',
  tip: 'cm-callout-tip',
  warning: 'cm-callout-warning',
  danger: 'cm-callout-danger',
  info: 'cm-callout-info',
  example: 'cm-callout-example',
  abstract: 'cm-callout-abstract',
  quote: 'cm-callout-quote',
}

/** Regex for callout syntax at start of a blockquote line */
const CALLOUT_REGEX = /^>\s*\[!([\w-]+)\]/

class CalloutPlugin {
  decorations: DecorationSet

  constructor(view: { state: EditorState }) {
    this.decorations = this.build(view.state)
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.selectionSet) {
      this.decorations = this.build(update.state)
    }
  }

  build(state: EditorState): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>()
    const cursorLine = state.doc.lineAt(state.selection.main.head).number

    for (let i = 1; i <= state.doc.lines; i++) {
      const line = state.doc.line(i)
      const match = line.text.match(CALLOUT_REGEX)
      if (!match) continue

      const type = match[1].toLowerCase()
      const cls = CALLOUT_TYPES[type] || 'cm-callout-note'

      // Find contiguous blockquote lines (the callout block)
      let endLine = i
      while (endLine + 1 <= state.doc.lines) {
        const next = state.doc.line(endLine + 1)
        if (next.text.startsWith('>')) endLine++
        else break
      }

      // Skip decoration if cursor is inside the callout block
      const cursorInBlock = cursorLine >= i && cursorLine <= endLine
      if (!cursorInBlock) {
        for (let j = i; j <= endLine; j++) {
          const bqLine = state.doc.line(j)
          builder.add(bqLine.from, bqLine.from, Decoration.line({ class: cls }))
        }
      }

      // Skip processed lines
      i = endLine
    }

    return builder.finish()
  }
}

/** Extension that styles Obsidian-style callout blocks */
export const calloutExtension = ViewPlugin.fromClass(CalloutPlugin, {
  decorations: (v) => v.decorations,
})
