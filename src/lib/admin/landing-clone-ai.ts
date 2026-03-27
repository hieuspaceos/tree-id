/**
 * AI landing page cloner — fetches a URL, sends HTML to Gemini,
 * returns structured sections + design config matching our builder schema.
 * Requires GEMINI_API_KEY env var.
 */

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

/** Section types and variants available in the landing page builder */
const SECTION_SCHEMA = `
Available section types and their variants:
- hero: variants=[centered, split, video-bg, minimal]. Fields: headline, subheadline, cta{text,url}, backgroundImage, embed
- features: variants=[grid, list, alternating]. Fields: heading, subheading, items[{icon,title,description}], columns(2|3|4)
- pricing: variants=[cards, simple, highlight-center]. Fields: heading, subheading, plans[{name,price,period,description,features[],cta{text,url},highlighted}]
- testimonials: variants=[cards, single, minimal]. Fields: heading, items[{quote,name,role,company,avatar}]
- faq: variants=[accordion, two-column, simple]. Fields: heading, items[{question,answer}]
- cta: variants=[default, split, banner, minimal, with-image]. Fields: headline, subheadline, cta{text,url}, backgroundImage
- stats: variants=[row, cards, large]. Fields: heading, items[{value,label,prefix,suffix}]
- how-it-works: variants=[numbered, timeline, cards]. Fields: heading, subheading, items[{number,title,description,icon}]
- team: variants=[grid, list, compact]. Fields: heading, subheading, members[{name,role,photo,bio}]
- logo-wall: Fields: heading, logos[{name,url,image}]
- nav: variants=[default, centered, transparent]. Fields: brandName, links[{label,href}]
- footer: variants=[simple, columns, minimal]. Fields: text, links[{label,href}], columns[{heading,links[{label,href}]}]
- video: Fields: url, caption, autoplay
- image: Fields: src, alt, caption, fullWidth
- image-text: Fields: image{src,alt}, heading, text, imagePosition(left|right), cta{text,url}
- gallery: Fields: heading, images[{src,alt,caption}]
- map: Fields: address, embedUrl, height
- rich-text: Fields: content (HTML string)
- divider: Fields: style(line|dots|space), height
- countdown: Fields: targetDate, heading, expiredText
- contact-form: Fields: heading, fields[{label,type}], submitText, submitUrl
- banner: Fields: text, cta{text,url}, variant(info|warning|success)
- layout: Fields: columns(number[]), gap, children[{column,sections[]}]
`

const SYSTEM_PROMPT = `You are an expert web designer. Analyze the HTML of a landing page and decompose it into structured sections matching our landing page builder schema.

${SECTION_SCHEMA}

For the design config, extract:
- colors: primary (brand color), secondary, accent, background, surface (card bg), text, textMuted
- fonts: heading font family, body font family
- borderRadius: e.g. "12px", "8px", "16px"

Rules:
- Map each visual section of the page to the BEST matching section type
- Choose the variant that best matches the visual layout
- Extract ALL text content (headlines, descriptions, button text, etc.)
- Extract image URLs as-is (absolute URLs)
- For nav: extract brand name and navigation links
- For footer: extract copyright text and links
- Order sections top-to-bottom (nav=-1, footer=999, others 0,1,2...)
- If a section doesn't match any type, use rich-text with the HTML content
- Extract colors from the page's CSS/inline styles — find the dominant brand color
- Keep content in the ORIGINAL language of the page

Return ONLY valid JSON (no markdown, no code blocks):
{
  "title": "Page title",
  "description": "Meta description or first paragraph summary",
  "design": {
    "colors": { "primary": "#hex", "secondary": "#hex", "accent": "#hex", "background": "#hex", "surface": "#hex", "text": "#hex", "textMuted": "#hex" },
    "fonts": { "heading": "Font Name", "body": "Font Name" },
    "borderRadius": "12px"
  },
  "sections": [
    { "type": "nav", "order": -1, "enabled": true, "data": { "brandName": "...", "links": [...], "variant": "default" } },
    { "type": "hero", "order": 0, "enabled": true, "data": { "headline": "...", "variant": "centered", ... } },
    ...
  ]
}`

export interface CloneResult {
  title: string
  description?: string
  design?: {
    colors?: Record<string, string>
    fonts?: { heading?: string; body?: string }
    borderRadius?: string
  }
  sections: Array<{
    type: string
    order: number
    enabled: boolean
    data: Record<string, unknown>
  }>
}

/** Fetch HTML from URL with timeout and size limit */
async function fetchPageHtml(url: string): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TreeID-Bot/1.0)' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const html = await res.text()
    // Limit to ~100K chars to stay within Gemini context
    return html.slice(0, 100_000)
  } finally {
    clearTimeout(timeout)
  }
}

/** Strip scripts, styles, and non-visible content to reduce token usage */
function cleanHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '[SVG]')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/** Send HTML to Gemini and get structured landing page config */
export async function cloneLandingPage(url: string): Promise<CloneResult> {
  const apiKey = import.meta.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured')

  // Fetch and clean HTML
  const rawHtml = await fetchPageHtml(url)
  const html = cleanHtml(rawHtml)

  if (html.length < 100) {
    throw new Error('Page content too short — may be a JavaScript-only SPA that requires a browser to render')
  }

  // Call Gemini
  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ parts: [{ text: `Analyze this landing page HTML and decompose into sections:\n\nURL: ${url}\n\n${html}` }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini API error: ${res.status} — ${err.slice(0, 200)}`)
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Empty response from Gemini')

  // Parse JSON response
  try {
    const result = JSON.parse(text) as CloneResult
    // Validate minimum structure
    if (!result.sections || !Array.isArray(result.sections)) {
      throw new Error('Invalid response: missing sections array')
    }
    return result
  } catch (e) {
    throw new Error(`Failed to parse AI response: ${(e as Error).message}`)
  }
}
