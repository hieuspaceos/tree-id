/**
 * Distribution IO barrel — factory + re-exports.
 */
export type { DistributionEntry, DistributionStats, ContentItem, DistributionIO } from './distribution-io-types'
export { getDistributionStats, buildContentInventory } from './distribution-stats'

import type { DistributionIO } from './distribution-io-types'
import { TursoDistributionIO } from './distribution-io-turso'
import { parseDistributionLog as localParseLog } from '../distribution-helpers'

// ── Factory ──

let _instance: DistributionIO | null = null

export function getDistributionIO(db?: any): DistributionIO {
  if (db) return new TursoDistributionIO(db)
  if (_instance) return _instance
  if (import.meta.env.PROD && import.meta.env.TURSO_URL) {
    _instance = new TursoDistributionIO()
  } else {
    _instance = {
      parseLog: async () => localParseLog(),
      appendEntry: async () => { /* CSV append handled by distribution-helpers in dev */ },
    }
  }
  return _instance
}
