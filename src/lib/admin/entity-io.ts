/**
 * Entity IO barrel — re-exports types + old functions (backward compat) + factory.
 * Phase 3 will migrate callers from direct functions to getEntityIO() factory.
 */
export type { EntityFieldDef, EntityPublicConfig, EntityDefinition, EntityInstance, EntityIO } from './entity-io-types'

// Backward-compat: re-export all functions from local implementation
export {
  listEntityDefinitions, getEntityDefinition, writeEntityDefinition, deleteEntityDefinition,
  listPublicEntityDefinitions, getPublicConfig,
  listEntityInstances, readEntityInstance, writeEntityInstance, deleteEntityInstance,
} from './entity-io-local'

import type { EntityIO } from './entity-io-types'
import { TursoEntityIO } from './entity-io-turso'
import * as local from './entity-io-local'

// ── Factory ──

let _instance: EntityIO | null = null

/** Get EntityIO: TursoIO (prod+Turso) or async-wrapped local functions (dev) */
export function getEntityIO(db?: any): EntityIO {
  if (db) return new TursoEntityIO(db)
  if (_instance) return _instance
  if (import.meta.env.PROD && import.meta.env.TURSO_URL) {
    _instance = new TursoEntityIO()
  } else {
    _instance = {
      listDefinitions: async () => local.listEntityDefinitions(),
      getDefinition: async (name) => local.getEntityDefinition(name),
      writeDefinition: async (name, def) => local.writeEntityDefinition(name, def),
      deleteDefinition: async (name) => local.deleteEntityDefinition(name),
      listPublicDefinitions: async () => local.listPublicEntityDefinitions(),
      getPublicConfig: async (name) => local.getPublicConfig(name),
      listInstances: async (entityName) => local.listEntityInstances(entityName),
      readInstance: async (entityName, slug) => local.readEntityInstance(entityName, slug),
      writeInstance: async (entityName, slug, data) => local.writeEntityInstance(entityName, slug, data),
      deleteInstance: async (entityName, slug) => local.deleteEntityInstance(entityName, slug),
    }
  }
  return _instance
}
