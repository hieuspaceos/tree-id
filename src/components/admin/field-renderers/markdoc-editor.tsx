/**
 * CodeMirror 6 Markdown editor — Obsidian-like Live Preview experience
 * Features: syntax highlighting, live preview, smart lists, auto-pairs,
 * heading fold, image preview, callout blocks, typewriter mode, vim mode, drag-drop
 */
import { useRef, useEffect, useCallback, useState } from 'react'
import { EditorView, placeholder as cmPlaceholder } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { basicSetup } from 'codemirror'
import { glassThemeExtension } from '../codemirror/cm-theme-glass'
import {
  wrapSelection, insertBlock, insertLink, insertCodeBlock,
  insertImage, createMarkdownKeymap,
} from '../codemirror/cm-markdown-commands'
import { smartListExtension } from '../codemirror/cm-smart-lists'
import { livePreviewExtension } from '../codemirror/cm-live-preview'
import { headingFoldExtension } from '../codemirror/cm-heading-fold'
import { imagePreviewExtension } from '../codemirror/cm-image-widget'
import { calloutExtension } from '../codemirror/cm-callout-widget'
import { typewriterModeExtension, toggleTypewriterMode } from '../codemirror/cm-typewriter-mode'
import { vimModeExtension, toggleVimMode, restoreVimPreference } from '../codemirror/cm-vim-toggle'
import { dragDropExtension } from '../codemirror/cm-drag-drop'
import { MediaBrowser } from '../media-browser'
import '@/styles/admin-editor.css'

interface Props {
  value: string
  onChange: (value: string) => void
}

export default function MarkdocEditor({ value, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  const [showMedia, setShowMedia] = useState(false)
  const [vimActive, setVimActive] = useState(false)
  const [twActive, setTwActive] = useState(false)
  const showMediaRef = useRef(() => setShowMedia(true))

  onChangeRef.current = onChange

  // Mount CodeMirror editor
  useEffect(() => {
    if (!containerRef.current) return

    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          vimModeExtension, // first for precedence
          createMarkdownKeymap({ onOpenMedia: () => showMediaRef.current() }),
          smartListExtension,
          basicSetup,
          markdown({ base: markdownLanguage, codeLanguages: languages }),
          glassThemeExtension,
          livePreviewExtension,
          headingFoldExtension,
          imagePreviewExtension,
          calloutExtension,
          typewriterModeExtension,
          dragDropExtension,
          cmPlaceholder('Start writing markdown...'),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current(update.state.doc.toString())
            }
          }),
          EditorView.lineWrapping,
        ],
      }),
      parent: containerRef.current,
    })

    viewRef.current = view

    // Restore vim preference from localStorage
    restoreVimPreference(view).then(() => {
      if (localStorage.getItem('admin-editor-vim-mode') === 'true') setVimActive(true)
    })

    return () => { view.destroy(); viewRef.current = null }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync external value changes (entry switch)
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const currentDoc = view.state.doc.toString()
    if (value !== currentDoc) {
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: value },
      })
    }
  }, [value])

  const exec = useCallback((fn: (view: EditorView) => void) => {
    if (viewRef.current) fn(viewRef.current)
  }, [])

  return (
    <div className="admin-editor-wrap">
      <div className="admin-editor-toolbar">
        <button type="button" title="Bold (Ctrl+B)" onClick={() => exec(v => wrapSelection(v, '**', '**'))}>B</button>
        <button type="button" title="Italic (Ctrl+I)" onClick={() => exec(v => wrapSelection(v, '*', '*'))}><em>I</em></button>
        <button type="button" title="Strikethrough" onClick={() => exec(v => wrapSelection(v, '~~', '~~'))}><s>S</s></button>
        <button type="button" title="Code" onClick={() => exec(v => wrapSelection(v, '`', '`'))}>{'<>'}</button>
        <div className="toolbar-divider" />
        <button type="button" title="Heading 2" onClick={() => exec(v => insertBlock(v, '\n## '))}>H2</button>
        <button type="button" title="Heading 3" onClick={() => exec(v => insertBlock(v, '\n### '))}>H3</button>
        <div className="toolbar-divider" />
        <button type="button" title="Bullet list" onClick={() => exec(v => insertBlock(v, '\n- '))}>•</button>
        <button type="button" title="Numbered list" onClick={() => exec(v => insertBlock(v, '\n1. '))}>1.</button>
        <button type="button" title="Blockquote" onClick={() => exec(v => insertBlock(v, '\n> '))}>❝</button>
        <div className="toolbar-divider" />
        <button type="button" title="Link (Ctrl+K)" onClick={() => exec(insertLink)}>🔗</button>
        <button type="button" title="Insert image (Ctrl+Shift+I)" onClick={() => setShowMedia(true)}>🖼</button>
        <button type="button" title="Code block" onClick={() => exec(insertCodeBlock)}>{'{}'}</button>
        <button type="button" title="Horizontal rule" onClick={() => exec(v => insertBlock(v, '\n---\n'))}>—</button>
        <div className="toolbar-spacer" />
        <button
          type="button"
          title="Typewriter mode"
          className={twActive ? 'active mode-toggle' : 'mode-toggle'}
          onClick={() => { exec(v => { const on = toggleTypewriterMode(v); setTwActive(on) }) }}
        >TW</button>
        <button
          type="button"
          title="Vim mode"
          className={vimActive ? 'active mode-toggle' : 'mode-toggle'}
          onClick={async () => {
            if (viewRef.current) {
              const on = await toggleVimMode(viewRef.current)
              setVimActive(on)
            }
          }}
        >vim</button>
      </div>
      <div ref={containerRef} className="admin-cm-container" />
      {showMedia && (
        <MediaBrowser
          mode="dialog"
          onSelect={(url) => exec(v => insertImage(v, url))}
          onClose={() => setShowMedia(false)}
        />
      )}
    </div>
  )
}
