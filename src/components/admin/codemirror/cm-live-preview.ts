/**
 * Live Preview ViewPlugin — cursor-aware inline markdown rendering
 * Hides markdown syntax when cursor is away, reveals raw syntax when cursor enters range.
 * Core of the Obsidian-like editing experience.
 */
import { type EditorView, ViewPlugin, type ViewUpdate, type DecorationSet, Decoration } from '@codemirror/view'
import { type EditorState, RangeSetBuilder } from '@codemirror/state'
import { syntaxTree } from '@codemirror/language'
import {
  hiddenMark, headingMarks,
  boldMark, italicMark, strikethroughMark, codeMark, linkTextMark, hrLineMark,
} from './cm-live-preview-styles'

type DecoEntry = { from: number; to: number; deco: Decoration }

/** Check if cursor/selection overlaps with a range */
function cursorInRange(state: EditorState, from: number, to: number): boolean {
  const { main } = state.selection
  return main.from <= to && main.to >= from
}

/** Check if cursor is on the same line as a position */
function cursorOnLine(state: EditorState, pos: number): boolean {
  const cursorLine = state.doc.lineAt(state.selection.main.head).number
  const targetLine = state.doc.lineAt(pos).number
  return cursorLine === targetLine
}

/** Collect decorations for a single syntax node */
function collectNode(
  state: EditorState,
  name: string, from: number, to: number,
  parentFrom: number | undefined,
  decos: DecoEntry[],
) {
  // ATX Headings — apply size mark to content, hide # markers
  if (name === 'HeaderMark') {
    const pFrom = parentFrom ?? from
    if (!cursorOnLine(state, pFrom)) {
      // Hide # and trailing space
      const nextChar = state.doc.sliceString(to, to + 1)
      const extra = nextChar === ' ' ? 1 : 0
      decos.push({ from, to: to + extra, deco: hiddenMark })
    }
  }

  // Apply heading size to entire heading line content
  if (name.startsWith('ATXHeading') && name.length <= 11) {
    const level = parseInt(name.slice(-1))
    if (level >= 1 && level <= 4 && !cursorOnLine(state, from)) {
      const mark = headingMarks[level - 1]
      // Find content after HeaderMark — apply size to whole line
      const line = state.doc.lineAt(from)
      const contentFrom = from + level + 1 // skip "## "
      if (contentFrom < line.to) {
        decos.push({ from: contentFrom, to: line.to, deco: mark })
      }
    }
  }

  // Bold — hide ** markers, apply bold to content
  if (name === 'StrongEmphasis' && !cursorInRange(state, from, to)) {
    if (to - from > 4) { // at least **x**
      decos.push({ from, to: from + 2, deco: hiddenMark })
      decos.push({ from: from + 2, to: to - 2, deco: boldMark })
      decos.push({ from: to - 2, to, deco: hiddenMark })
    }
  }

  // Italic — hide * markers, apply italic to content
  if (name === 'Emphasis' && !cursorInRange(state, from, to)) {
    if (to - from > 2) { // at least *x*
      decos.push({ from, to: from + 1, deco: hiddenMark })
      decos.push({ from: from + 1, to: to - 1, deco: italicMark })
      decos.push({ from: to - 1, to, deco: hiddenMark })
    }
  }

  // Strikethrough — hide ~~ markers
  if (name === 'Strikethrough' && !cursorInRange(state, from, to)) {
    if (to - from > 4) {
      decos.push({ from, to: from + 2, deco: hiddenMark })
      decos.push({ from: from + 2, to: to - 2, deco: strikethroughMark })
      decos.push({ from: to - 2, to, deco: hiddenMark })
    }
  }

  // Inline code — hide backticks, apply code style
  if (name === 'InlineCode' && !cursorInRange(state, from, to)) {
    if (to - from > 2) {
      decos.push({ from, to: from + 1, deco: hiddenMark })
      decos.push({ from: from + 1, to: to - 1, deco: codeMark })
      decos.push({ from: to - 1, to, deco: hiddenMark })
    }
  }

  // Links [text](url) — hide syntax, style link text
  if (name === 'Link' && !cursorInRange(state, from, to)) {
    const content = state.doc.sliceString(from, to)
    const bracketEnd = content.indexOf(']')
    if (bracketEnd > 0) {
      // Hide opening [
      decos.push({ from, to: from + 1, deco: hiddenMark })
      // Style link text
      decos.push({ from: from + 1, to: from + bracketEnd, deco: linkTextMark })
      // Hide ](url)
      decos.push({ from: from + bracketEnd, to, deco: hiddenMark })
    }
  }

  // Horizontal rule — add line decoration
  if (name === 'HorizontalRule' && !cursorOnLine(state, from)) {
    const line = state.doc.lineAt(from)
    decos.push({ from: line.from, to: line.from, deco: hrLineMark })
  }
}

/** Build sorted DecorationSet from syntax tree */
function buildDecorations(view: EditorView): DecorationSet {
  const decos: DecoEntry[] = []
  const state = view.state

  for (const { from, to } of view.visibleRanges) {
    syntaxTree(state).iterate({
      from, to,
      enter: (node) => {
        collectNode(state, node.type.name, node.from, node.to, node.node.parent?.from, decos)
      },
    })
  }

  // RangeSetBuilder requires sorted-by-from order
  decos.sort((a, b) => a.from - b.from || a.to - b.to)

  const builder = new RangeSetBuilder<Decoration>()
  for (const { from: f, to: t, deco } of decos) {
    try { builder.add(f, t, deco) } catch { /* skip overlapping ranges */ }
  }
  return builder.finish()
}

class LivePreviewPlugin {
  decorations: DecorationSet

  constructor(view: EditorView) {
    this.decorations = buildDecorations(view)
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.selectionSet || update.viewportChanged) {
      this.decorations = buildDecorations(update.view)
    }
  }
}

/** Live Preview extension — add to EditorState extensions after markdown() */
export const livePreviewExtension = ViewPlugin.fromClass(LivePreviewPlugin, {
  decorations: (v) => v.decorations,
})
