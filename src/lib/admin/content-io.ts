/**
 * Content I/O barrel — re-exports types + implementations + factory
 * Existing imports from './content-io' continue to work unchanged
 */
export type { EntryMeta, EntryData, ContentIO } from './content-io-types'
export { CONTENT_BASE, pickMeta, isArticle, articlePath, articleDir, yamlPath, singletonPath } from './content-io-types'
export { LocalContentIO } from './content-io-local'
export { GitHubContentIO } from './content-io-github'

import type { ContentIO } from './content-io-types'
import { LocalContentIO } from './content-io-local'
import { GitHubContentIO } from './content-io-github'

// ── Factory ──

let _instance: ContentIO | null = null

/** Get the appropriate ContentIO implementation based on environment */
export function getContentIO(): ContentIO {
  if (!_instance) {
    _instance = import.meta.env.PROD ? new GitHubContentIO() : new LocalContentIO()
  }
  return _instance
}
