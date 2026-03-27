/**
 * Generate content directory + registry fragment JSON.
 */
import type { SkillSpec } from '../feature-builder-spec-types'
import type { FileDescriptor } from './generate-types'

export function generateContentScaffold(spec: SkillSpec): FileDescriptor[] {
  const name = spec.skill.name
  const ti = spec.treeidIntegration

  // Registry fragment — convenience JSON for manual registration
  const registryFragment = {
    id: name,
    label: ti.navItem.label,
    description: spec.skill.description,
    section: ti.section,
    iconKey: ti.navItem.iconKey,
    routes: ti.components.map(c => ({
      path: c.replace('feature-', '/').replace('.tsx', '').replace(/-list$/, '').replace(/-editor$/, '/:slug').replace(/-form$/, '').replace(/-dashboard$/, ''),
    })),
    navItems: [ti.navItem],
  }

  return [
    { path: `src/content/${name}/.gitkeep`, content: '' },
    {
      path: `src/content/feature-specs/${name}.registry.json`,
      content: JSON.stringify(registryFragment, null, 2),
    },
  ]
}
