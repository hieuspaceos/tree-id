/**
 * Read theme ID from site-settings — via ContentIO (prod) or YAML file (dev).
 * Falls back to 'liquid-glass' if missing or parse error.
 * Now ASYNC — callers must await.
 */
export async function getActiveThemeId(): Promise<string> {
  try {
    const useTurso = import.meta.env.PROD && import.meta.env.TURSO_URL
    if (useTurso) {
      const { getContentIO } = await import('./admin/content-io')
      const io = getContentIO()
      const settings = await io.readSingleton('site-settings')
      return (settings?.themeId as string) || 'liquid-glass'
    }
    // Dev: read YAML directly (no IO factory needed)
    const fs = await import('node:fs')
    const path = await import('node:path')
    const filePath = path.resolve('src/content/site-settings.yaml')
    const content = fs.readFileSync(filePath, 'utf-8')
    const match = content.match(/themeId:\s*['"]?([a-z0-9-]+)['"]?/)
    return match?.[1] || 'liquid-glass'
  } catch {
    return 'liquid-glass'
  }
}
