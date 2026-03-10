/** Shape of a frontend theme — all values are CSS-ready strings */
export interface ThemeDefinition {
  id: string
  name: string
  /** Brand accent, e.g. '#3b82f6' */
  accent: string
  accentSoft: string
  /** Secondary / leaf, e.g. '#22c55e' */
  secondary: string
  secondarySoft: string
  /** Page background */
  bgBase: string
  /** Radial gradient tint 1 */
  bgGradient1: string
  /** Radial gradient tint 2 */
  bgGradient2: string
  /** Panel / nav background rgba */
  glassBg: string
  /** Card background rgba */
  glassCard: string
  /** Glass border rgba */
  glassBorder: string
  /** Backdrop-filter blur value, e.g. '16px' */
  glassBlur: string
  /** CSS font-family stack */
  fontFamily: string
}
