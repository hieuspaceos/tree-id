/**
 * Site compatibility analysis for AI clone pipeline.
 * Detects framework, content quality, and clone feasibility before any AI call.
 */
import { directFetch, firecrawlFetch } from './clone-ai-utils'

/** Framework detection patterns for tier scoring */
export const DETECTORS: Array<{ name: string; patterns: string[]; boost: number }> = [
  { name: 'Astro', patterns: ['astro-island', 'astro-slot'], boost: 20 },
  { name: 'Hugo', patterns: ['gohugo.io', 'hugo-'], boost: 18 },
  { name: 'Next.js', patterns: ['/_next/', '__NEXT_DATA__'], boost: 15 },
  { name: 'Nuxt', patterns: ['__nuxt', '/_nuxt/'], boost: 15 },
  { name: 'SvelteKit', patterns: ['__sveltekit'], boost: 15 },
  { name: 'Remix', patterns: ['__remixContext'], boost: 15 },
  { name: 'Gatsby', patterns: ['gatsby-', '___gatsby'], boost: 12 },
  { name: 'Jekyll', patterns: ['jekyll'], boost: 15 },
  { name: 'WordPress', patterns: ['wp-content', 'wp-includes'], boost: 5 },
  { name: 'Shopify', patterns: ['cdn.shopify.com'], boost: 5 },
  { name: 'Webflow', patterns: ['webflow.com', 'w-webflow'], boost: 8 },
  { name: 'Wix', patterns: ['wix.com', 'wixsite.com'], boost: 3 },
  { name: 'Squarespace', patterns: ['squarespace'], boost: 5 },
  { name: 'Ghost', patterns: ['ghost.org', 'ghost-portal'], boost: 10 },
  { name: 'React SPA', patterns: ['<div id="root"></div>'], boost: -15 },
  { name: 'Angular', patterns: ['ng-version', '<app-root'], boost: -20 },
  { name: 'Cloudflare', patterns: ['cf-challenge', 'jschl_answer'], boost: -30 },
]

export interface SiteAnalysis {
  tier: 1 | 2 | 3 | 4
  score: number
  label: string
  framework: string
  details: string[]
  canClone: boolean
}

/** Analyze raw HTML and compute site compatibility score (no AI call) */
export function analyzeHtml(html: string): SiteAnalysis {
  const details: string[] = []
  let score = 50
  let framework = 'Unknown'
  for (const d of DETECTORS) {
    if (d.patterns.some(p => html.includes(p))) { framework = d.name; score += d.boost; break }
  }
  details.push(`Framework: ${framework}`)

  const cleaned = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<!--[\s\S]*?-->/g, '')
  const words = cleaned.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(w => w.length > 2)
  if (words.length < 30) { score -= 40; details.push(`⚠️ ${words.length} words (SPA)`) }
  else if (words.length <= 800) { score += 15; details.push(`✓ ${words.length} words`) }
  else if (words.length <= 2000) { score += 5; details.push(`${words.length} words (heavy)`) }
  else { score -= 15; details.push(`⚠️ ${words.length} words (very heavy)`) }

  const semantic = (html.match(/<(section|nav|footer|header|h[1-6])/gi) || []).length
  if (semantic >= 5) { score += 15; details.push(`✓ ${semantic} semantic tags`) }
  else if (semantic >= 2) { score += 5; details.push(`${semantic} semantic tags`) }
  else { score -= 10; details.push(`⚠️ No semantic tags`) }

  const cleanSize = cleaned.length
  if (cleanSize <= 50000) { score += 10; details.push(`✓ ${(cleanSize/1000).toFixed(0)}K chars`) }
  else if (cleanSize <= 150000) { details.push(`${(cleanSize/1000).toFixed(0)}K chars`) }
  else { score -= 10; details.push(`⚠️ ${(cleanSize/1000).toFixed(0)}K chars`) }

  score = Math.max(0, Math.min(100, score))
  const tier = score >= 70 ? 1 : score >= 50 ? 2 : score >= 30 ? 3 : 4 as 1|2|3|4
  const labels = { 1: 'Excellent', 2: 'Good', 3: 'Challenging', 4: 'Low — try Paste Code' }
  return { tier, score, label: labels[tier], framework, details, canClone: score >= 20 }
}

/** Fetch HTML — Firecrawl first (best quality), direct fetch as fallback */
export async function fetchPageHtml(url: string): Promise<string> {
  const firecrawlKey = import.meta.env.FIRECRAWL_API_KEY || process.env.FIRECRAWL_API_KEY
  if (firecrawlKey) {
    try {
      const fcHtml = await firecrawlFetch(url, firecrawlKey)
      if (fcHtml.length > 500) return fcHtml
    } catch {}
  }
  return await directFetch(url)
}

/** Pre-analyze site compatibility (no AI call) */
export async function analyzeSiteCompatibility(url: string): Promise<SiteAnalysis> {
  const html = await fetchPageHtml(url)
  return analyzeHtml(html)
}
