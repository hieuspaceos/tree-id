/**
 * Landing config reader — server-side helpers for reading/writing landing page YAML.
 * Used by admin API endpoints and GoClaw API endpoints.
 * Delegates to content-io for actual file I/O.
 */
import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'
import type { LandingPageConfig } from './landing-types'

const LANDING_DIR = 'src/content/landing-pages'
const TEMPLATES_DIR = 'src/content/templates'

/** Read a landing page config by slug */
export function readLandingConfig(slug: string, basePath = process.cwd()): LandingPageConfig | null {
  const filePath = path.join(basePath, LANDING_DIR, `${slug}.yaml`)
  if (!fs.existsSync(filePath)) return null
  try {
    const raw = yaml.load(fs.readFileSync(filePath, 'utf-8')) as Record<string, unknown>
    return { slug, ...raw } as LandingPageConfig
  } catch {
    return null
  }
}

/** Write a landing page config */
export function writeLandingConfig(slug: string, config: LandingPageConfig, basePath = process.cwd()): void {
  const dir = path.join(basePath, LANDING_DIR)
  fs.mkdirSync(dir, { recursive: true })
  const { slug: _, ...rest } = config
  fs.writeFileSync(path.join(dir, `${slug}.yaml`), yaml.dump(rest, { lineWidth: 120 }))
}

/** Delete a landing page config */
export function deleteLandingConfig(slug: string, basePath = process.cwd()): boolean {
  const filePath = path.join(basePath, LANDING_DIR, `${slug}.yaml`)
  if (!fs.existsSync(filePath)) return false
  fs.unlinkSync(filePath)
  return true
}

/** List all landing page configs (metadata only for list views) */
export function listLandingConfigs(basePath = process.cwd()): Array<{ slug: string; title: string; template?: string; sectionCount: number }> {
  const dir = path.join(basePath, LANDING_DIR)
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.yaml'))
    .map(f => {
      const slug = f.replace('.yaml', '')
      const config = readLandingConfig(slug, basePath)
      return config
        ? { slug, title: config.title, template: config.template, sectionCount: config.sections?.length ?? 0 }
        : null
    })
    .filter(Boolean) as Array<{ slug: string; title: string; template?: string; sectionCount: number }>
}

/** Read a template by name */
export function readTemplate(name: string, basePath = process.cwd()): Record<string, unknown> | null {
  const filePath = path.join(basePath, TEMPLATES_DIR, `${name}.yaml`)
  if (!fs.existsSync(filePath)) return null
  try {
    return yaml.load(fs.readFileSync(filePath, 'utf-8')) as Record<string, unknown>
  } catch {
    return null
  }
}

/** List all templates */
export function listTemplates(basePath = process.cwd()): Array<{ name: string; description?: string; targetAudience?: string }> {
  const dir = path.join(basePath, TEMPLATES_DIR)
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.yaml'))
    .map(f => {
      const name = f.replace('.yaml', '')
      const data = readTemplate(name, basePath) as Record<string, unknown> | null
      return data
        ? { name, description: data.description as string | undefined, targetAudience: data.targetAudience as string | undefined }
        : null
    })
    .filter(Boolean) as Array<{ name: string; description?: string; targetAudience?: string }>
}
