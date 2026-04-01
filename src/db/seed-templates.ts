/**
 * Seed landing page templates from YAML files into Turso.
 * Idempotent — uses onConflictDoNothing (templates are immutable seed data).
 * Run: npx tsx src/db/seed-templates.ts
 */
import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'
import { getDb } from './client'
import { landingTemplates } from './schema-content'

const TEMPLATES_DIR = path.join(process.cwd(), 'src/content/templates')

export async function seedTemplates() {
  const db = getDb()
  if (!fs.existsSync(TEMPLATES_DIR)) {
    console.log('No templates directory found, skipping.')
    return
  }

  const files = fs.readdirSync(TEMPLATES_DIR).filter(f => f.endsWith('.yaml'))
  console.log(`Seeding ${files.length} templates...`)

  for (const file of files) {
    const name = file.replace('.yaml', '')
    const raw = yaml.load(
      fs.readFileSync(path.join(TEMPLATES_DIR, file), 'utf-8')
    ) as Record<string, unknown>

    await db.insert(landingTemplates).values({
      name,
      description: (raw.description as string) || null,
      targetAudience: (raw.targetAudience as string) || null,
      config: JSON.stringify(raw),
    }).onConflictDoNothing()

    console.log(`  ✓ ${name}`)
  }

  console.log('Templates seeded.')
}

// Run directly
seedTemplates().catch(console.error)
