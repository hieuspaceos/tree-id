/**
 * SEO Analyzer — RankMath-style scoring engine for articles
 * Runs client-side, uses regex for keyword matching / heading extraction
 */

export interface SeoCheck {
  id: string
  category: string
  pass: boolean
  score: number
  maxScore: number
  message: string
}

export interface SeoResult {
  score: number
  checks: SeoCheck[]
}

interface SeoInput {
  title: string
  description: string
  slug: string
  content: string
  seo: { focusKeyword?: string; seoTitle?: string; ogImage?: string; noindex?: boolean }
  cover: { url?: string; alt?: string }
  tags: string[]
  links: { outbound?: string[] }
}

/** Count words in text (strips markdown syntax) */
function wordCount(text: string): number {
  const plain = text.replace(/[#*_\[\]()>`~|]/g, ' ').trim()
  return plain ? plain.split(/\s+/).length : 0
}

/** Calculate keyword density as percentage */
function keywordDensity(content: string, keyword: string): number {
  if (!keyword || !content) return 0
  const words = wordCount(content)
  if (words === 0) return 0
  const kw = keyword.toLowerCase()
  const matches = content.toLowerCase().split(kw).length - 1
  const kwWords = kw.split(/\s+/).length
  return (matches * kwWords / words) * 100
}

/** Extract H2/H3 headings from markdown */
function extractHeadings(content: string): string[] {
  const matches = content.match(/^#{2,3}\s+.+$/gm) || []
  return matches.map((h) => h.replace(/^#{2,3}\s+/, ''))
}

/** Check if content has markdown images */
function hasImages(content: string): boolean {
  return /!\[.*?\]\(.*?\)/.test(content) || /<img\s/.test(content)
}

/** Normalize text for keyword comparison */
function norm(text: string): string {
  return (text || '').toLowerCase().trim()
}

function check(id: string, cat: string, pass: boolean, max: number, msg: string): SeoCheck {
  return { id, category: cat, pass, score: pass ? max : 0, maxScore: max, message: msg }
}

export function analyzeSeo(input: Partial<SeoInput>): SeoResult {
  const title = input.title || ''
  const desc = input.description || ''
  const slug = input.slug || ''
  const content = input.content || ''
  const seo = input.seo || {}
  const cover = input.cover || {}
  const tags = input.tags || []
  const outbound = input.links?.outbound || []
  const kw = norm(seo.focusKeyword || '')
  const headings = extractHeadings(content)
  const words = wordCount(content)
  const first10pct = content.slice(0, Math.ceil(content.length * 0.1))

  const checks: SeoCheck[] = []

  // ── Basic SEO (40pt) ──
  const CAT_BASIC = 'Basic SEO'
  checks.push(check('kw-set', CAT_BASIC, kw.length > 0, 5, kw ? 'Focus keyword is set' : 'Set a focus keyword'))
  checks.push(check('kw-title', CAT_BASIC, kw ? norm(title).includes(kw) : false, 5, kw && norm(title).includes(kw) ? 'Keyword found in title' : 'Add keyword to title'))
  checks.push(check('kw-desc', CAT_BASIC, kw ? norm(desc).includes(kw) : false, 5, kw && norm(desc).includes(kw) ? 'Keyword found in description' : 'Add keyword to meta description'))
  checks.push(check('kw-slug', CAT_BASIC, kw ? norm(slug).includes(kw.replace(/\s+/g, '-')) : false, 5, kw && norm(slug).includes(kw.replace(/\s+/g, '-')) ? 'Keyword found in URL' : 'Add keyword to URL slug'))
  checks.push(check('kw-intro', CAT_BASIC, kw ? norm(first10pct).includes(kw) : false, 5, kw && norm(first10pct).includes(kw) ? 'Keyword in first 10% of content' : 'Use keyword early in content'))

  const density = kw ? keywordDensity(content, kw) : 0
  const densityOk = kw ? density >= 0.5 && density <= 2.5 : false
  checks.push(check('kw-density', CAT_BASIC, densityOk, 5, densityOk ? `Keyword density ${density.toFixed(1)}% (good)` : kw ? `Keyword density ${density.toFixed(1)}% (aim for 0.5-2.5%)` : 'Set keyword to check density'))

  const kwInHeading = kw ? headings.some((h) => norm(h).includes(kw)) : false
  checks.push(check('kw-heading', CAT_BASIC, kwInHeading, 5, kwInHeading ? 'Keyword found in subheading' : 'Add keyword to an H2/H3'))

  const descLen = desc.length
  const descLenOk = descLen >= 120 && descLen <= 160
  checks.push(check('desc-len', CAT_BASIC, descLenOk, 5, descLenOk ? `Description length ${descLen} chars (good)` : `Description ${descLen} chars (aim for 120-160)`))

  // ── Title Readability (15pt) ──
  const CAT_TITLE = 'Title Readability'
  const titleLen = title.length
  const titleLenOk = titleLen >= 30 && titleLen <= 60
  checks.push(check('title-len', CAT_TITLE, titleLenOk, 5, titleLenOk ? `Title length ${titleLen} chars (good)` : `Title ${titleLen} chars (aim for 30-60)`))

  const kwInFirstHalf = kw ? norm(title.slice(0, Math.ceil(title.length / 2))).includes(kw) : false
  checks.push(check('kw-title-pos', CAT_TITLE, kwInFirstHalf, 5, kwInFirstHalf ? 'Keyword in first half of title' : 'Move keyword to beginning of title'))

  const hasSeoTitle = !!(seo.seoTitle && seo.seoTitle !== title)
  checks.push(check('seo-title', CAT_TITLE, hasSeoTitle, 5, hasSeoTitle ? 'Custom SEO title set' : 'Set a unique SEO title'))

  // ── Content (30pt) ──
  const CAT_CONTENT = 'Content'
  checks.push(check('content-len', CAT_CONTENT, words >= 600, 10, words >= 600 ? `${words} words (good)` : `${words} words (aim for 600+)`))
  checks.push(check('internal-links', CAT_CONTENT, outbound.length > 0, 5, outbound.length > 0 ? `${outbound.length} internal link(s)` : 'Add internal links'))
  checks.push(check('has-images', CAT_CONTENT, hasImages(content), 5, hasImages(content) ? 'Content has images' : 'Add images to content'))
  checks.push(check('has-headings', CAT_CONTENT, headings.length > 0, 5, headings.length > 0 ? `${headings.length} subheading(s)` : 'Add H2/H3 subheadings'))
  checks.push(check('toc-worthy', CAT_CONTENT, headings.length >= 3, 5, headings.length >= 3 ? 'Enough headings for ToC' : `${headings.length}/3 headings for table of contents`))

  // ── Additional (15pt) ──
  const CAT_EXTRA = 'Additional'
  checks.push(check('cover-set', CAT_EXTRA, !!cover.url, 5, cover.url ? 'Featured image set' : 'Add a featured image'))
  checks.push(check('cover-alt', CAT_EXTRA, !!(cover.url && cover.alt), 5, cover.url && cover.alt ? 'Featured image has alt text' : 'Add alt text to featured image'))
  checks.push(check('tags-set', CAT_EXTRA, tags.length > 0, 5, tags.length > 0 ? `${tags.length} tag(s) set` : 'Add at least one tag'))

  const score = checks.reduce((sum, c) => sum + c.score, 0)
  return { score, checks }
}
