/**
 * Landing IO barrel — factory + backward-compat re-exports.
 * Old import path: landing-config-reader.ts (still works, kept as local impl)
 * New import path: landing-io.ts (factory pattern)
 */
export type { LandingIO } from './landing-io-types'

// Backward-compat re-exports from local implementation
export {
  readLandingConfig, writeLandingConfig, deleteLandingConfig,
  listLandingConfigs, readTemplate, listTemplates,
} from './landing-config-reader'

import type { LandingIO } from './landing-io-types'
import { TursoLandingIO } from './landing-io-turso'
import * as local from './landing-config-reader'

// ── Factory ──

let _instance: LandingIO | null = null

export function getLandingIO(db?: any): LandingIO {
  if (db) return new TursoLandingIO(db)
  if (_instance) return _instance
  if (import.meta.env.PROD && import.meta.env.TURSO_URL) {
    _instance = new TursoLandingIO()
  } else {
    _instance = {
      readConfig: async (slug) => local.readLandingConfig(slug),
      writeConfig: async (slug, config) => local.writeLandingConfig(slug, config),
      deleteConfig: async (slug) => local.deleteLandingConfig(slug),
      listConfigs: async () => local.listLandingConfigs(),
      readTemplate: async (name) => local.readTemplate(name),
      listTemplates: async () => local.listTemplates(),
    }
  }
  return _instance
}
