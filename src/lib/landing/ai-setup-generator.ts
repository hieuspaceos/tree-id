/**
 * AI setup generator — uses Gemini Flash REST API to generate a landing page
 * config from a product description. Returns null if GEMINI_API_KEY not set.
 */
import type { LandingPageConfig } from './landing-types'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

const SYSTEM_PROMPT = `You are a landing page designer. Given a product description, generate a complete landing page configuration as JSON.

Return ONLY valid JSON matching this structure (no markdown, no explanation):
{
  "title": "Page title",
  "description": "Meta description",
  "sections": [
    {
      "type": "hero",
      "order": 0,
      "enabled": true,
      "data": { "headline": "...", "subheadline": "...", "cta": { "text": "...", "url": "#" } }
    }
  ]
}

Available section types: hero, features, pricing, testimonials, faq, cta, stats, how-it-works, team, logo-wall.
Include 4-6 relevant sections based on the product type.
Keep copy concise and compelling. Use placeholders for URLs (#).`

export async function generateLandingPageFromDescription(
  description: string,
  slug: string,
): Promise<LandingPageConfig | null> {
  const apiKey = import.meta.env.GEMINI_API_KEY
  if (!apiKey) return null

  const prompt = `Product description: ${description}\nSlug: ${slug}\n\nGenerate landing page JSON:`

  const body = {
    contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\n${prompt}` }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
  }

  let res: Response
  try {
    res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      console.error('Gemini API timed out after 30s for slug:', slug)
    }
    return null
  }

  if (!res.ok) return null

  const json = await res.json()
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined
  if (!text) return null

  // Strip markdown code fences if present
  const cleaned = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()

  try {
    const parsed = JSON.parse(cleaned) as Partial<LandingPageConfig>
    return {
      slug,
      title: parsed.title || 'Landing Page',
      description: parsed.description,
      sections: parsed.sections || [],
    }
  } catch {
    return null
  }
}
