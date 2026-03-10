import type { ThemeDefinition } from './theme-types'
import { liquidGlass } from './liquid-glass'

/** Registry — add new themes here */
const themes: Record<string, ThemeDefinition> = {
  'liquid-glass': liquidGlass,
}

/** List all registered theme ids + names (for admin select options) */
export function getAvailableThemes(): { value: string; label: string }[] {
  return Object.values(themes).map((t) => ({ value: t.id, label: t.name }))
}

/** Resolve a theme by id (falls back to liquid-glass) */
export function getTheme(id: string): ThemeDefinition {
  return themes[id] ?? liquidGlass
}

/** Convert a ThemeDefinition into a CSS variable map for React style prop */
export function themeToStyleVars(theme: ThemeDefinition): Record<string, string> {
  return {
    '--t-accent': theme.accent,
    '--t-accent-soft': theme.accentSoft,
    '--t-secondary': theme.secondary,
    '--t-secondary-soft': theme.secondarySoft,
    '--t-bg-base': theme.bgBase,
    '--t-bg-gradient1': theme.bgGradient1,
    '--t-bg-gradient2': theme.bgGradient2,
    '--t-glass-bg': theme.glassBg,
    '--t-glass-card': theme.glassCard,
    '--t-glass-border': theme.glassBorder,
    '--t-glass-blur': theme.glassBlur,
    '--t-font-family': theme.fontFamily,
  }
}
