/**
 * Editor toolbar — format buttons for Milkdown editor
 * Dispatches ProseMirror commands via editor context
 */
import type { Editor } from '@milkdown/core'
import { callCommand } from '@milkdown/utils'
import {
  toggleStrongCommand,
  toggleEmphasisCommand,
  wrapInBlockquoteCommand,
  insertHrCommand,
} from '@milkdown/preset-commonmark'
import {
  toggleStrikethroughCommand,
} from '@milkdown/preset-gfm'

interface Props {
  editor: Editor | null
  mode: 'wysiwyg' | 'source'
  onToggleMode: () => void
}

export function EditorToolbar({ editor, mode, onToggleMode }: Props) {
  function run(cmd: Parameters<typeof callCommand>[0]) {
    if (!editor) return
    try {
      editor.action(callCommand(cmd))
    } catch { /* command may not be available */ }
  }

  return (
    <div className="admin-editor-toolbar">
      {mode === 'wysiwyg' && (
        <>
          <button type="button" title="Bold (Ctrl+B)" onClick={() => run(toggleStrongCommand.key)}>
            B
          </button>
          <button type="button" title="Italic (Ctrl+I)" onClick={() => run(toggleEmphasisCommand.key)}>
            <em>I</em>
          </button>
          <button type="button" title="Strikethrough" onClick={() => run(toggleStrikethroughCommand.key)}>
            <s>S</s>
          </button>
          <div className="toolbar-divider" />
          <button type="button" title="Blockquote" onClick={() => run(wrapInBlockquoteCommand.key)}>
            "
          </button>
          <button type="button" title="Horizontal Rule" onClick={() => run(insertHrCommand.key)}>
            —
          </button>
        </>
      )}

      <div className="toolbar-spacer" />

      <button
        type="button"
        className={`mode-toggle ${mode === 'source' ? 'active' : ''}`}
        onClick={onToggleMode}
        title="Toggle raw Markdown source"
      >
        {mode === 'wysiwyg' ? '{ }' : 'Rich'}
      </button>
    </div>
  )
}
