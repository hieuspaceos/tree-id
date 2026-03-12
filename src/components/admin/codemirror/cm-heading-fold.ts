/**
 * Heading-level folding for Markdown
 * Collapses content between headings of same or higher level
 */
import { foldService, syntaxTree } from '@codemirror/language'
import type { EditorState } from '@codemirror/state'

/** Detect heading level from syntax tree at a line position */
function getHeadingLevel(state: EditorState, lineFrom: number, lineTo: number): number {
  let level = 0
  syntaxTree(state).iterate({
    from: lineFrom, to: lineTo,
    enter: (node) => {
      const name = node.type.name
      if (name.startsWith('ATXHeading') && name.length <= 11) {
        level = parseInt(name.slice(-1))
      }
    },
  })
  return level
}

/**
 * Fold service: fold from end of heading line to start of next
 * same-or-higher-level heading (or document end)
 */
function markdownFoldService(state: EditorState, from: number, _to: number) {
  const line = state.doc.lineAt(from)
  const headingLevel = getHeadingLevel(state, line.from, line.to)
  if (headingLevel === 0) return null

  // Find next heading of same or higher level
  const lastLine = state.doc.lines
  for (let i = line.number + 1; i <= lastLine; i++) {
    const nextLine = state.doc.line(i)
    const nextLevel = getHeadingLevel(state, nextLine.from, nextLine.to)
    if (nextLevel > 0 && nextLevel <= headingLevel) {
      const prevLine = state.doc.line(i - 1)
      if (prevLine.to <= line.to) return null
      return { from: line.to, to: prevLine.to }
    }
  }

  // No next heading — fold to end of document
  if (state.doc.length <= line.to) return null
  return { from: line.to, to: state.doc.length }
}

/** Extension enabling heading fold in Markdown documents */
export const headingFoldExtension = foldService.of(markdownFoldService)
