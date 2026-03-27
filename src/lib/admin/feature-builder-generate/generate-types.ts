/**
 * Shared types for the code generation engine.
 */

/** A file to be written to disk */
export interface FileDescriptor {
  /** Relative path from project root */
  path: string
  /** File content as string */
  content: string
}

/** Result returned by generateAllFiles */
export interface GenerateResult {
  files: FileDescriptor[]
  /** TypeScript snippet to paste into feature-registry.ts */
  registrySnippet: string
  warnings: string[]
}
