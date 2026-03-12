/**
 * Inline image preview widget for CodeMirror 6
 * Renders image preview below ![alt](url) lines in the editor
 */
import {
  WidgetType, EditorView, ViewPlugin, type ViewUpdate,
  Decoration, type DecorationSet,
} from '@codemirror/view'
import { RangeSetBuilder } from '@codemirror/state'
import { syntaxTree } from '@codemirror/language'

/** Widget that renders an <img> preview below image markdown */
class ImageWidget extends WidgetType {
  constructor(readonly url: string, readonly alt: string) { super() }

  eq(other: ImageWidget) { return other.url === this.url }

  toDOM() {
    const wrap = document.createElement('div')
    wrap.className = 'cm-image-preview'

    const img = document.createElement('img')
    img.src = this.url
    img.alt = this.alt || 'image'
    img.loading = 'lazy'
    img.className = 'cm-image-preview-img'
    img.onerror = () => {
      wrap.innerHTML = '<div class="cm-image-preview-error">Image failed to load</div>'
    }
    wrap.appendChild(img)
    return wrap
  }

  ignoreEvent() { return true }
}

/** Extract image URL and alt text from an Image syntax node */
function extractImageData(state: { sliceDoc: (from: number, to: number) => string }, from: number, to: number) {
  const text = state.sliceDoc(from, to)
  const match = text.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
  if (!match) return null
  return { alt: match[1], url: match[2] }
}

class ImagePreviewPlugin {
  decorations: DecorationSet

  constructor(view: EditorView) {
    this.decorations = this.build(view)
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = this.build(update.view)
    }
  }

  build(view: EditorView): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>()

    for (const { from, to } of view.visibleRanges) {
      syntaxTree(view.state).iterate({
        from, to,
        enter: (node) => {
          if (node.type.name === 'Image') {
            const data = extractImageData(view.state, node.from, node.to)
            if (data?.url) {
              const line = view.state.doc.lineAt(node.to)
              builder.add(line.to, line.to, Decoration.widget({
                widget: new ImageWidget(data.url, data.alt),
                block: true,
                side: 1,
              }))
            }
          }
        },
      })
    }

    return builder.finish()
  }
}

/** Extension that shows inline image previews below ![](url) lines */
export const imagePreviewExtension = ViewPlugin.fromClass(ImagePreviewPlugin, {
  decorations: (v) => v.decorations,
})
