/**
 * Live Preview decoration specs — reusable Decoration.mark instances
 * Used by cm-live-preview.ts to style markdown tokens inline
 */
import { Decoration } from '@codemirror/view'

/** Hide markdown syntax markers (##, **, *, ~~, `, [, ](url)) */
export const hiddenMark = Decoration.mark({ class: 'cm-lp-hidden' })

/** Heading decorations — applied to heading content text (not markers) */
export const heading1Mark = Decoration.mark({ class: 'cm-lp-h1' })
export const heading2Mark = Decoration.mark({ class: 'cm-lp-h2' })
export const heading3Mark = Decoration.mark({ class: 'cm-lp-h3' })
export const heading4Mark = Decoration.mark({ class: 'cm-lp-h4' })

/** Inline formatting decorations */
export const boldMark = Decoration.mark({ class: 'cm-lp-bold' })
export const italicMark = Decoration.mark({ class: 'cm-lp-italic' })
export const strikethroughMark = Decoration.mark({ class: 'cm-lp-strike' })
export const codeMark = Decoration.mark({ class: 'cm-lp-code' })
export const linkTextMark = Decoration.mark({ class: 'cm-lp-link' })

/** Horizontal rule rendered decoration */
export const hrLineMark = Decoration.line({ class: 'cm-lp-hr' })

/** Heading size marks indexed by level (1-based, capped at 4) */
export const headingMarks = [heading1Mark, heading2Mark, heading3Mark, heading4Mark]
