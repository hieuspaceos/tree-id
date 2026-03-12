/**
 * Smart list continuation, auto-pairs, and indent extensions
 * Wraps built-in CM6 markdown commands into a single extension bundle
 */
import { keymap } from '@codemirror/view'
import { indentWithTab } from '@codemirror/commands'
import { markdownKeymap } from '@codemirror/lang-markdown'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'

/**
 * Combined extension for smart editing:
 * - Enter: continues list markers, blockquotes, task lists
 * - Backspace: smart markup deletion (removes markers first)
 * - Tab/Shift+Tab: indent/dedent list items
 * - Auto-close brackets, quotes, backticks on typing
 */
export const smartListExtension = [
  closeBrackets(),
  keymap.of([
    ...closeBracketsKeymap,
    ...markdownKeymap,
    indentWithTab,
  ]),
]
