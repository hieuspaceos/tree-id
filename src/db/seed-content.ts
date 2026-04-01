/**
 * One-time content migration: YAML/Markdoc files → Turso DB.
 * Idempotent — uses onConflictDoUpdate (upsert) for all tables.
 * Run: npx tsx src/db/seed-content.ts
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import yaml from 'js-yaml'
import matter from 'gray-matter'
import { getDb } from './client'
import {
  contentEntries, siteSettings, subscribers, entityDefinitions,
  entityInstances, ownerLandingPages, productConfigs,
} from './schema-content'
import { seedTemplates } from './seed-templates'

const CONTENT = path.join(process.cwd(), 'src/content')
const uid = () => crypto.randomUUID()

function readYaml(filePath: string): Record<string, unknown> {
  return yaml.load(fs.readFileSync(filePath, 'utf-8')) as Record<string, unknown>
}

function yamlFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter(f => f.endsWith('.yaml'))
}

/** Seed content_entries for a YAML-based collection */
async function seedYamlCollection(db: ReturnType<typeof getDb>, collection: string, dir: string) {
  const files = yamlFiles(dir)
  for (const file of files) {
    const slug = file.replace('.yaml', '')
    const raw = readYaml(path.join(dir, file))
    const title = (raw.title || raw.name || slug) as string
    const status = (raw.status as string) || 'published'
    const { title: _t, name: _n, status: _s, description: _d, publishedAt: _p, ...rest } = raw

    await db.insert(contentEntries).values({
      id: uid(), collection, slug, title, status,
      description: (raw.description as string) || '',
      body: (raw.content as string) || null,
      metadata: JSON.stringify(rest),
      publishedAt: (raw.publishedAt as string) || null,
    }).onConflictDoUpdate({
      target: contentEntries.id,
      set: { title, status, metadata: JSON.stringify(rest), updatedAt: new Date().toISOString() },
    })
    console.log(`  ✓ ${collection}/${slug}`)
  }
}

/** Seed articles from Markdoc files (frontmatter + body) */
async function seedArticles(db: ReturnType<typeof getDb>) {
  const dir = path.join(CONTENT, 'articles')
  if (!fs.existsSync(dir)) return
  const slugs = fs.readdirSync(dir).filter(d =>
    fs.statSync(path.join(dir, d)).isDirectory()
  )

  for (const slug of slugs) {
    const mdocPath = path.join(dir, slug, 'index.mdoc')
    if (!fs.existsSync(mdocPath)) continue
    const raw = fs.readFileSync(mdocPath, 'utf-8')
    const { data: fm, content: body } = matter(raw)
    const title = (fm.title || slug) as string
    const status = (fm.status as string) || 'draft'
    const { title: _t, status: _s, description: _d, publishedAt: _p, ...rest } = fm

    await db.insert(contentEntries).values({
      id: uid(), collection: 'articles', slug, title, status,
      description: (fm.description as string) || '',
      body,
      metadata: JSON.stringify(rest),
      publishedAt: (fm.publishedAt as string) || null,
    }).onConflictDoUpdate({
      target: contentEntries.id,
      set: { title, status, body, metadata: JSON.stringify(rest), updatedAt: new Date().toISOString() },
    })
    console.log(`  ✓ articles/${slug}`)
  }
}

/** Seed site-settings singleton */
async function seedSiteSettings(db: ReturnType<typeof getDb>) {
  const file = path.join(CONTENT, 'site-settings.yaml')
  if (!fs.existsSync(file)) return
  const raw = readYaml(file)
  await db.insert(siteSettings).values({
    key: 'site-settings',
    value: JSON.stringify(raw),
  }).onConflictDoUpdate({
    target: siteSettings.key,
    set: { value: JSON.stringify(raw), updatedAt: new Date().toISOString() },
  })
  console.log('  ✓ site-settings')
}

/** Seed entity definitions */
async function seedEntityDefs(db: ReturnType<typeof getDb>) {
  const files = yamlFiles(path.join(CONTENT, 'entity-definitions'))
  for (const file of files) {
    const name = file.replace('.yaml', '')
    const raw = readYaml(path.join(CONTENT, 'entity-definitions', file))
    await db.insert(entityDefinitions).values({
      name,
      label: (raw.label as string) || name,
      description: (raw.description as string) || null,
      fields: JSON.stringify(raw.fields || []),
      publicConfig: raw.public ? JSON.stringify(raw.public) : null,
    }).onConflictDoUpdate({
      target: entityDefinitions.name,
      set: { fields: JSON.stringify(raw.fields || []), updatedAt: new Date().toISOString() },
    })
    console.log(`  ✓ entity-def/${name}`)
  }
}

/** Seed entity instances */
async function seedEntityInstances(db: ReturnType<typeof getDb>) {
  const entitiesDir = path.join(CONTENT, 'entities')
  if (!fs.existsSync(entitiesDir)) return
  const entityDirs = fs.readdirSync(entitiesDir).filter(d =>
    fs.statSync(path.join(entitiesDir, d)).isDirectory()
  )
  for (const entityName of entityDirs) {
    const files = yamlFiles(path.join(entitiesDir, entityName))
    for (const file of files) {
      const slug = file.replace('.yaml', '')
      const raw = readYaml(path.join(entitiesDir, entityName, file))
      await db.insert(entityInstances).values({
        id: uid(), entityName, slug, data: JSON.stringify(raw),
      }).onConflictDoUpdate({
        target: entityInstances.id,
        set: { data: JSON.stringify(raw), updatedAt: new Date().toISOString() },
      })
      console.log(`  ✓ entity/${entityName}/${slug}`)
    }
  }
}

/** Seed owner landing pages */
async function seedLandingPages(db: ReturnType<typeof getDb>) {
  const files = yamlFiles(path.join(CONTENT, 'landing-pages'))
  for (const file of files) {
    const slug = file.replace('.yaml', '')
    const raw = readYaml(path.join(CONTENT, 'landing-pages', file))
    await db.insert(ownerLandingPages).values({
      slug,
      title: (raw.title as string) || slug,
      template: (raw.template as string) || null,
      config: JSON.stringify(raw),
    }).onConflictDoUpdate({
      target: ownerLandingPages.slug,
      set: { config: JSON.stringify(raw), updatedAt: new Date().toISOString() },
    })
    console.log(`  ✓ landing/${slug}`)
  }
}

/** Seed product configs */
async function seedProducts(db: ReturnType<typeof getDb>) {
  const files = yamlFiles(path.join(CONTENT, 'products'))
  for (const file of files) {
    const slug = file.replace('.yaml', '')
    const raw = readYaml(path.join(CONTENT, 'products', file))
    const { name: n, description: d, icon: i, slug: _s, ...rest } = raw
    await db.insert(productConfigs).values({
      slug,
      name: (n as string) || slug,
      description: (d as string) || null,
      icon: (i as string) || null,
      config: JSON.stringify(rest),
    }).onConflictDoUpdate({
      target: productConfigs.slug,
      set: { name: (n as string) || slug, config: JSON.stringify(rest), updatedAt: new Date().toISOString() },
    })
    console.log(`  ✓ product/${slug}`)
  }
}

/** Seed subscriber files (if any exist) */
async function seedSubscribers(db: ReturnType<typeof getDb>) {
  const files = yamlFiles(path.join(CONTENT, 'subscribers'))
  for (const file of files) {
    const raw = readYaml(path.join(CONTENT, 'subscribers', file))
    const email = (raw.email as string) || ''
    if (!email) continue
    await db.insert(subscribers).values({
      id: uid(),
      email,
      token: (raw.token as string) || crypto.randomUUID(),
      subscribedAt: (raw.subscribedAt as string) || null,
    }).onConflictDoNothing()
    console.log(`  ✓ subscriber/${email}`)
  }
}

async function main() {
  console.log('=== Content Migration: Files → Turso ===\n')
  const db = getDb()

  await seedSiteSettings(db)
  await seedArticles(db)
  await seedYamlCollection(db, 'notes', path.join(CONTENT, 'notes'))
  await seedYamlCollection(db, 'records', path.join(CONTENT, 'records'))
  await seedYamlCollection(db, 'categories', path.join(CONTENT, 'categories'))
  await seedYamlCollection(db, 'voices', path.join(CONTENT, 'voices'))
  await seedEntityDefs(db)
  await seedEntityInstances(db)
  await seedLandingPages(db)
  await seedProducts(db)
  await seedSubscribers(db)
  await seedTemplates()

  console.log('\n=== Migration complete ===')
}

main().catch(console.error)
