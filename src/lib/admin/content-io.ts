/**
 * Content I/O barrel — re-exports types + implementations + factory
 * Existing imports from './content-io' continue to work unchanged
 */
export type { EntryMeta, EntryData, ContentIO } from './content-io-types'
export { CONTENT_BASE, pickMeta, isArticle, articlePath, articleDir, yamlPath, singletonPath } from './content-io-types'
export { LocalContentIO } from './content-io-local'
export { GitHubContentIO } from './content-io-github'
export { TursoContentIO } from './content-io-turso'

import type { ContentIO } from './content-io-types'
import { LocalContentIO } from './content-io-local'
import { GitHubContentIO } from './content-io-github'
import { TursoContentIO } from './content-io-turso'

// ── Factory ──

let _instance: ContentIO | null = null

/** Get ContentIO: TursoIO (prod+Turso) > GitHubIO (prod) > LocalIO (dev) */
export function getContentIO(db?: any): ContentIO {
  if (db) return new TursoContentIO(db)
  if (_instance) return _instance
  const useTurso = import.meta.env.PROD && import.meta.env.TURSO_URL
  _instance = useTurso
    ? new TursoContentIO()
    : import.meta.env.PROD
      ? new GitHubContentIO()
      : new LocalContentIO()
  return _instance
}
