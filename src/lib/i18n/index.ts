/**
 * Lightweight i18n module — JSON translation files, no dependencies
 * Usage: t('voice.tone.casual') → "Thân mật" (if locale=vi)
 * Sections marked with _section key for admin UI grouping
 */
import en from './en.json'
import vi from './vi.json'

export type Locale = 'en' | 'vi'

/** All loaded translation dictionaries */
const dictionaries: Record<Locale, Record<string, unknown>> = { en, vi }

/** Current active locale — defaults to 'en', set via setLocale() */
let currentLocale: Locale = 'en'

/** Set the active locale */
export function setLocale(locale: Locale): void {
  if (dictionaries[locale]) currentLocale = locale
}

/** Get the active locale */
export function getLocale(): Locale {
  return currentLocale
}

/** Get all available locales */
export function getAvailableLocales(): Locale[] {
  return Object.keys(dictionaries) as Locale[]
}

/**
 * Translate a dot-path key using the current locale
 * Falls back to English if key not found in current locale
 * Falls back to the key itself if not found anywhere
 *
 * @example t('voice.tone.casual') → "Thân mật" (vi) or "Casual" (en)
 * @example t('voice.tone.casual', 'vi') → "Thân mật" (force locale)
 */
export function t(key: string, forceLocale?: Locale): string {
  const locale = forceLocale || currentLocale
  const result = resolve(dictionaries[locale], key)
  if (result !== undefined) return String(result)

  // Fallback to English
  if (locale !== 'en') {
    const fallback = resolve(dictionaries.en, key)
    if (fallback !== undefined) return String(fallback)
  }

  // Return the last segment of the key as readable fallback
  return key.split('.').pop() || key
}

/** Resolve a dot-path in a nested object */
function resolve(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

/**
 * Get a full section as flat key-value pairs (for admin translations UI)
 * @example getSection('voice.tone') → { casual: "Thân mật", professional: "Chuyên nghiệp", ... }
 */
export function getSection(sectionPath: string, locale?: Locale): Record<string, string> {
  const loc = locale || currentLocale
  const section = resolve(dictionaries[loc], sectionPath)
  if (!section || typeof section !== 'object') return {}

  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(section as Record<string, unknown>)) {
    if (key.startsWith('_')) continue // skip meta keys like _label, _section
    if (typeof value === 'string') result[key] = value
  }
  return result
}

/**
 * Get all top-level sections with their _section display names
 * @returns [{ key: 'voice', name: 'Writing Voice' }, ...]
 */
export function getSections(locale?: Locale): Array<{ key: string; name: string }> {
  const loc = locale || currentLocale
  const dict = dictionaries[loc]
  return Object.entries(dict)
    .filter(([, v]) => typeof v === 'object' && v !== null && '_section' in (v as Record<string, unknown>))
    .map(([key, v]) => ({ key, name: (v as Record<string, unknown>)._section as string }))
}

/**
 * Get full dictionary for a locale (used by admin translations editor)
 */
export function getDictionary(locale: Locale): Record<string, unknown> {
  return dictionaries[locale] || dictionaries.en
}

/**
 * Update a single translation value (runtime only — for admin preview)
 * To persist, call the admin API to write the JSON file
 */
export function updateTranslation(locale: Locale, key: string, value: string): void {
  const parts = key.split('.')
  const lastPart = parts.pop()
  if (!lastPart) return

  let current: Record<string, unknown> = dictionaries[locale]
  for (const part of parts) {
    if (!current[part] || typeof current[part] !== 'object') {
      current[part] = {}
    }
    current = current[part] as Record<string, unknown>
  }
  current[lastPart] = value
}
