/**
 * CodeMirror 6 Markdown formatting commands
 * Pure functions dispatching transactions on EditorView — no React dependency
 */
import { type EditorView, keymap } from '@codemirror/view'

/** Wrap current selection with prefix/suffix. If no selection, inserts prefix + 'text' + suffix */
export function wrapSelection(view: EditorView, prefix: string, suffix: string) {
  const { from, to } = view.state.selection.main
  const selected = view.state.sliceDoc(from, to)
  const replacement = prefix + (selected || 'text') + suffix
  const cursorStart = from + prefix.length
  const cursorEnd = selected ? cursorStart + selected.length : cursorStart + 4

  view.dispatch({
    changes: { from, to, insert: replacement },
    selection: { anchor: cursorStart, head: cursorEnd },
  })
  view.focus()
}

/** Insert text at cursor position (line-level blocks like headings, lists) */
export function insertBlock(view: EditorView, text: string) {
  const pos = view.state.selection.main.head
  view.dispatch({
    changes: { from: pos, insert: text },
    selection: { anchor: pos + text.length },
  })
  view.focus()
}

/** Insert Markdown link wrapping current selection */
export function insertLink(view: EditorView) {
  const { from, to } = view.state.selection.main
  const selected = view.state.sliceDoc(from, to)
  if (selected) {
    const replacement = `[${selected}](url)`
    const urlStart = from + selected.length + 3
    view.dispatch({
      changes: { from, to, insert: replacement },
      selection: { anchor: urlStart, head: urlStart + 3 },
    })
  } else {
    const replacement = '[text](url)'
    const textStart = from + 1
    view.dispatch({
      changes: { from, insert: replacement },
      selection: { anchor: textStart, head: textStart + 4 },
    })
  }
  view.focus()
}

/** Insert fenced code block */
export function insertCodeBlock(view: EditorView) {
  const { from, to } = view.state.selection.main
  const selected = view.state.sliceDoc(from, to)
  const replacement = '\n```\n' + (selected || '') + '\n```\n'
  const cursorPos = from + 4
  view.dispatch({
    changes: { from, to, insert: replacement },
    selection: { anchor: cursorPos, head: selected ? cursorPos + selected.length : cursorPos },
  })
  view.focus()
}

/** Insert image markdown at cursor */
export function insertImage(view: EditorView, url: string) {
  const pos = view.state.selection.main.head
  const text = `\n![](${url})\n`
  view.dispatch({
    changes: { from: pos, insert: text },
    selection: { anchor: pos + text.length },
  })
  view.focus()
}

/** Create keymap extension for Markdown shortcuts — accepts callbacks for React-managed state */
export function createMarkdownKeymap(callbacks: { onOpenMedia: () => void }) {
  return keymap.of([
    { key: 'Mod-b', run: (view) => { wrapSelection(view, '**', '**'); return true } },
    { key: 'Mod-i', run: (view) => { wrapSelection(view, '*', '*'); return true } },
    { key: 'Mod-k', run: (view) => { insertLink(view); return true } },
    { key: 'Mod-Shift-i', run: () => { callbacks.onOpenMedia(); return true } },
  ])
}
