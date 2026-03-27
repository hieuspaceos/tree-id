/**
 * Generate .claude/skills/{name}/ folder files — SKILL.md + references.
 */
import type { SkillSpec } from '../feature-builder-spec-types'
import type { FileDescriptor } from './generate-types'

/** Build SKILL.md with proper frontmatter */
function buildSkillMd(spec: SkillSpec): string {
  const lines = [
    '---',
    `name: ${spec.skill.name}`,
    `description: "${spec.skill.description.replace(/"/g, '\\"')}"`,
    `version: ${spec.skill.version}`,
    '---',
    '',
    spec.skill.body,
  ]
  return lines.join('\n')
}

/** Build implementation guide reference doc */
function buildImplementationGuide(spec: SkillSpec): string {
  const { treeidIntegration: ti, dataSchema } = spec
  const lines = [
    `# Implementation Guide — ${spec.skill.name}`,
    '',
    '## Data Schema',
    '',
    '| Field | Type | Required |',
    '|-------|------|----------|',
  ]

  for (const f of dataSchema.suggestedFields) {
    lines.push(`| ${f.name} | ${f.type} | ${f.required ? 'Yes' : 'No'} |`)
  }

  lines.push(
    '',
    '## Tree-id Integration',
    '',
    `- **Section:** ${ti.section}`,
    `- **UI type:** ${ti.uiNeeds}`,
    `- **Components:** ${ti.components.join(', ') || 'None'}`,
    `- **API routes:** ${ti.apiRoutes.join(', ')}`,
    `- **Nav:** ${ti.navItem.label} → \`${ti.navItem.href}\``,
    '',
    '## API Endpoints',
    '',
    `- \`GET /api/admin/${spec.skill.name}\` — List all entries`,
    `- \`POST /api/admin/${spec.skill.name}\` — Create entry`,
    `- \`PUT /api/admin/${spec.skill.name}?slug=X\` — Update entry`,
    `- \`DELETE /api/admin/${spec.skill.name}?slug=X\` — Delete entry`,
    '',
    '## Content Storage',
    '',
    `Entries stored as YAML files in \`src/content/${spec.skill.name}/\`.`,
    'Each file is named `{slug}.yaml`.',
  )
  return lines.join('\n')
}

export function generateSkillFiles(spec: SkillSpec): FileDescriptor[] {
  const base = `.claude/skills/${spec.skill.name}`
  const files: FileDescriptor[] = [
    { path: `${base}/SKILL.md`, content: buildSkillMd(spec) },
    { path: `${base}/references/implementation-guide.md`, content: buildImplementationGuide(spec) },
  ]

  // Additional reference files (beyond implementation-guide)
  for (const ref of spec.references) {
    if (ref.filename === 'implementation-guide.md') continue
    files.push({
      path: `${base}/references/${ref.filename}`,
      content: `# ${ref.filename}\n\n${ref.purpose}\n\n<!-- TODO: Add detailed content -->\n`,
    })
  }

  return files
}
