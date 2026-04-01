/**
 * Landing IO types — interface for landing page config + template storage.
 */
import type { LandingPageConfig } from './landing-types'

export interface LandingIO {
  readConfig(slug: string): Promise<LandingPageConfig | null>
  writeConfig(slug: string, config: LandingPageConfig): Promise<void>
  deleteConfig(slug: string): Promise<boolean>
  listConfigs(): Promise<Array<{ slug: string; title: string; template?: string; sectionCount: number }>>
  readTemplate(name: string): Promise<Record<string, unknown> | null>
  listTemplates(): Promise<Array<{ name: string; description?: string; targetAudience?: string }>>
}

export type { LandingPageConfig }
