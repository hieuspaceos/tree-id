import { RichText, defaultJSXConverters } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState, SerializedLexicalNode } from 'lexical'
import type { JSXConverters } from '@payloadcms/richtext-lexical/react'

export interface TocHeading {
  id: string
  text: string
  level: number
}

/** Extract plain text from a lexical node tree recursively */
function extractText(node: SerializedLexicalNode): string {
  if ('text' in node && typeof (node as { text: string }).text === 'string') {
    return (node as { text: string }).text
  }
  if ('children' in node && Array.isArray((node as { children: SerializedLexicalNode[] }).children)) {
    return (node as { children: SerializedLexicalNode[] }).children.map(extractText).join('')
  }
  return ''
}

/** Generate a URL-safe slug from heading text */
function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

/** Extract headings from serialized Lexical editor state for ToC */
export function extractHeadings(data: SerializedEditorState): TocHeading[] {
  if (!data?.root?.children) return []
  const headings: TocHeading[] = []

  for (const node of data.root.children) {
    if (node.type === 'heading' && 'tag' in node) {
      const tag = (node as { tag: string }).tag
      const level = parseInt(tag.replace('h', ''), 10)
      const text = extractText(node)
      if (text) {
        headings.push({ id: slugify(text), text, level })
      }
    }
  }
  return headings
}

/** Custom converters that add id attributes to headings for anchor linking */
const convertersWithHeadingIds: JSXConverters = {
  ...defaultJSXConverters,
  heading: ({ node, nodesToJSX }) => {
    const Tag = (node as unknown as { tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' }).tag
    const text = extractText(node as unknown as SerializedLexicalNode)
    const id = slugify(text)
    return <Tag id={id}>{nodesToJSX({ nodes: (node as unknown as { children: SerializedLexicalNode[] }).children })}</Tag>
  },
}

/** Render Lexical serialized JSON to React elements with heading anchors */
export function LexicalRenderer({ data }: { data: SerializedEditorState }) {
  if (!data) return null
  return (
    <div className="prose prose-gray max-w-none">
      <RichText data={data} converters={convertersWithHeadingIds} />
    </div>
  )
}
