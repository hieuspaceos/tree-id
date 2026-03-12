/**
 * Typewriter/focus mode for CodeMirror 6
 * Centers current line vertically, dims lines far from cursor
 * Toggled via Compartment — on/off without re-creating editor
 */
import { Compartment, RangeSetBuilder } from '@codemirror/state'
import {
  EditorView, ViewPlugin, type ViewUpdate,
  Decoration, type DecorationSet,
} from '@codemirror/view'

const dimmedLine = Decoration.line({ class: 'cm-typewriter-dimmed' })

/** Plugin that dims lines more than 3 lines from cursor */
class TypewriterPlugin {
  decorations: DecorationSet

  constructor(view: EditorView) {
    this.decorations = this.build(view)
  }

  update(update: ViewUpdate) {
    if (update.selectionSet || update.docChanged) {
      this.decorations = this.build(update.view)
    }
  }

  build(view: EditorView): DecorationSet {
    const cursorLine = view.state.doc.lineAt(view.state.selection.main.head).number
    const builder = new RangeSetBuilder<Decoration>()

    for (let i = 1; i <= view.state.doc.lines; i++) {
      if (Math.abs(i - cursorLine) > 3) {
        const line = view.state.doc.line(i)
        builder.add(line.from, line.from, dimmedLine)
      }
    }

    return builder.finish()
  }
}

const typewriterPlugin = ViewPlugin.fromClass(TypewriterPlugin, {
  decorations: (v) => v.decorations,
})

/** Scroll margins to keep current line vertically centered */
const typewriterScroll = EditorView.scrollMargins.of((view) => ({
  top: view.dom.clientHeight / 2 - 20,
  bottom: view.dom.clientHeight / 2 - 20,
}))

const typewriterExtensions = [typewriterPlugin, typewriterScroll]

/** Compartment for toggling typewriter mode */
export const typewriterCompartment = new Compartment()

/** Toggle typewriter mode on/off — returns new state */
export function toggleTypewriterMode(view: EditorView): boolean {
  const current = typewriterCompartment.get(view.state)
  const isOn = Array.isArray(current) ? current.length > 0 : current !== null
  view.dispatch({
    effects: typewriterCompartment.reconfigure(isOn ? [] : typewriterExtensions),
  })
  return !isOn
}

/** Initial extension (off by default) */
export const typewriterModeExtension = typewriterCompartment.of([])
