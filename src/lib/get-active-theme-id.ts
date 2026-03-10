import fs from 'node:fs'
import path from 'node:path'

/**
 * Read theme ID from site-settings YAML singleton.
 * Falls back to 'liquid-glass' if file missing or parse error.
 */
export function getActiveThemeId(): string {
  try {
    const filePath = path.resolve('src/content/site-settings.yaml')
    const content = fs.readFileSync(filePath, 'utf-8')
    // Simple regex parse for single key — no yaml dependency needed
    const match = content.match(/themeId:\s*['"]?([a-z0-9-]+)['"]?/)
    return match?.[1] || 'liquid-glass'
  } catch {
    return 'liquid-glass'
  }
}
