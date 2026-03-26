/**
 * Admin API: read/write i18n translation JSON files
 * GET — returns all translations for a locale
 * PUT — writes updated translations to the JSON file
 */
import type { APIRoute } from 'astro'
import { checkFeatureEnabled } from '@/lib/admin/feature-guard'

export const prerender = false

/** Unflatten dot-path keys back to nested object */
function unflatten(flat: Record<string, string>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.')
    let current: Record<string, unknown> = result
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]] || typeof current[parts[i]] !== 'object') {
        current[parts[i]] = {}
      }
      current = current[parts[i]] as Record<string, unknown>
    }
    current[parts[parts.length - 1]] = value
  }
  return result
}

export const GET: APIRoute = async ({ url }) => {
  const fc = checkFeatureEnabled('translations')
  if (!fc.enabled) return fc.response
  const locale = url.searchParams.get('locale') || 'en'
  const validLocales = ['en', 'vi']
  if (!validLocales.includes(locale)) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid locale' }), { status: 400 })
  }

  try {
    const fs = await import('node:fs/promises')
    const path = await import('node:path')
    const filePath = path.resolve(`src/lib/i18n/${locale}.json`)
    const raw = await fs.readFile(filePath, 'utf-8')
    return new Response(JSON.stringify({ ok: true, data: JSON.parse(raw) }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'File not found' }), { status: 404 })
  }
}

export const PUT: APIRoute = async ({ request }) => {
  const fc = checkFeatureEnabled('translations')
  if (!fc.enabled) return fc.response
  try {
    const { locale, translations } = await request.json()
    const validLocales = ['en', 'vi']
    if (!validLocales.includes(locale)) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid locale' }), { status: 400 })
    }

    const fs = await import('node:fs/promises')
    const path = await import('node:path')

    // Unflatten dot-path keys back to nested JSON
    const nested = unflatten(translations as Record<string, string>)
    const filePath = path.resolve(`src/lib/i18n/${locale}.json`)
    await fs.writeFile(filePath, JSON.stringify(nested, null, 2) + '\n', 'utf-8')

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500 })
  }
}
