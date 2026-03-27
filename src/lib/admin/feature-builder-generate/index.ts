/**
 * Code generation orchestrator — combines all generators into a single call.
 * Returns file descriptors (no disk I/O) + registry snippet + warnings.
 */
import type { SkillSpec } from '../feature-builder-spec-types'
import type { GenerateResult } from './generate-types'
import { generateSkillFiles } from './generate-skill-files'
import { generateAdminComponents } from './generate-admin-components'
import { generateApiRoute } from './generate-api-route'
import { generateContentScaffold } from './generate-content-scaffold'

export type { FileDescriptor, GenerateResult } from './generate-types'

/** Generate all files for a feature from its SkillSpec */
export function generateAllFiles(spec: SkillSpec): GenerateResult {
  const warnings: string[] = []
  const name = spec.skill.name

  // Sanitize name and apply to spec copy
  const safeName = name.replace(/[^a-z0-9-]/g, '')
  if (!safeName) {
    return { files: [], registrySnippet: '', warnings: ['Invalid skill name'] }
  }
  const safeSpec: SkillSpec = {
    ...spec,
    skill: { ...spec.skill, name: safeName },
  }

  // Collect all file descriptors using sanitized spec
  const files = [
    ...generateSkillFiles(safeSpec),
    ...generateAdminComponents(safeSpec),
    ...generateApiRoute(safeSpec),
    ...generateContentScaffold(safeSpec),
  ]

  // Build registry snippet for manual paste
  const label = spec.treeidIntegration.navItem.label.replace(/'/g, "\\'")
  const registrySnippet = `// Add to FEATURES array in src/lib/admin/feature-registry.ts:
{
  id: '${safeName}',
  label: '${label}',
  description: '${spec.skill.description.replace(/'/g, "\\'")}',
  section: '${spec.treeidIntegration.section}',
  iconKey: '${spec.treeidIntegration.navItem.iconKey}',
  routes: [],   // TODO: add lazy route imports
  navItems: [{ href: '${spec.treeidIntegration.navItem.href}', label: '${label}', iconKey: '${spec.treeidIntegration.navItem.iconKey}' }],
}`

  return { files, registrySnippet, warnings }
}
