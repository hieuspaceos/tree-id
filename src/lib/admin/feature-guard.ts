/**
 * Server-side feature guard — checks if a feature is enabled.
 * Reads from TursoIO (prod) or site-settings.yaml (dev) with 5s cache.
 * Now ASYNC — all callers must `await checkFeatureEnabled(...)`.
 */
import { siteSettingsSchema } from './validation'

const CACHE_TTL = 5000
let _cachedFeatures: Record<string, boolean> | undefined
let _cacheTimestamp = 0

/** Read enabledFeatures from IO layer (async) */
async function readEnabledFeatures(): Promise<Record<string, boolean> | undefined> {
  if (_cachedFeatures !== undefined && Date.now() - _cacheTimestamp < CACHE_TTL) {
    return _cachedFeatures
  }

  try {
    const useTurso = import.meta.env.PROD && import.meta.env.TURSO_URL
    let parsed: Record<string, unknown> | null = null

    if (useTurso) {
      const { getContentIO } = await import('./content-io')
      const io = getContentIO()
      parsed = await io.readSingleton('site-settings')
    } else {
      const fs = await import('node:fs')
      const path = await import('node:path')
      const yaml = await import('js-yaml')
      const settingsPath = path.join(process.cwd(), 'src/content/site-settings.yaml')
      const raw = fs.readFileSync(settingsPath, 'utf-8')
      parsed = yaml.load(raw) as Record<string, unknown> | null
    }

    const validated = siteSettingsSchema.safeParse(parsed)
    _cachedFeatures = validated.success ? validated.data.enabledFeatures : undefined
    _cacheTimestamp = Date.now()
    return _cachedFeatures
  } catch {
    _cachedFeatures = undefined
    _cacheTimestamp = Date.now()
    return undefined
  }
}

/**
 * Check if a feature is enabled. Returns 403 response if disabled.
 * ASYNC — callers must use: const fc = await checkFeatureEnabled('email')
 */
export async function checkFeatureEnabled(featureId: string):
  Promise<{ enabled: true } | { enabled: false; response: Response }> {
  const features = await readEnabledFeatures()

  // No enabledFeatures config = all features enabled (backward compat)
  if (!features) return { enabled: true }
  // Missing key = enabled (backward compat)
  if (features[featureId] !== false) return { enabled: true }

  return {
    enabled: false,
    response: new Response(
      JSON.stringify({ ok: false, error: `Feature "${featureId}" is disabled` }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    ),
  }
}
