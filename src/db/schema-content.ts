/**
 * Content tables — owner instance content stored in Turso.
 * Replaces YAML/JSON file-based storage for serverless compatibility.
 * Better Auth tables (user, session, account, verification) and SaaS
 * landing_pages table live in schema.ts — DO NOT duplicate here.
 */
import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core'

/** Generic content entries — articles, notes, records, categories, voices */
export const contentEntries = sqliteTable('content_entries', {
  id: text('id').primaryKey(),
  collection: text('collection').notNull(),   // 'articles' | 'notes' | 'records' | 'categories' | 'voices'
  slug: text('slug').notNull(),
  title: text('title').notNull().default(''),
  status: text('status').notNull().default('draft'),
  description: text('description').default(''),
  /** Markdown body for articles, null for YAML collections */
  body: text('body'),
  /** All frontmatter/fields as JSON string */
  metadata: text('metadata').notNull().default('{}'),
  publishedAt: text('published_at'),
  createdAt: text('created_at').default("(datetime('now'))"),
  updatedAt: text('updated_at').default("(datetime('now'))"),
}, (table) => [
  uniqueIndex('uniq_content_collection_slug').on(table.collection, table.slug),
  index('idx_content_collection_status').on(table.collection, table.status),
])

/** Singleton key-value store — site-settings and other config */
export const siteSettings = sqliteTable('site_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull().default('{}'),
  updatedAt: text('updated_at').default("(datetime('now'))"),
})

/** Email subscribers */
export const subscribers = sqliteTable('subscribers', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  token: text('token').notNull().unique(),
  subscribedAt: text('subscribed_at').default("(datetime('now'))"),
}, (table) => [
  index('idx_subscribers_email').on(table.email),
  index('idx_subscribers_token').on(table.token),
])

/** Custom entity definitions — schema metadata for dynamic entities */
export const entityDefinitions = sqliteTable('entity_definitions', {
  name: text('name').primaryKey(),
  label: text('label').notNull(),
  description: text('description'),
  /** JSON array of EntityFieldDef */
  fields: text('fields').notNull().default('[]'),
  /** JSON object of EntityPublicConfig or null */
  publicConfig: text('public_config'),
  createdAt: text('created_at').default("(datetime('now'))"),
  updatedAt: text('updated_at').default("(datetime('now'))"),
})

/** Custom entity instances — data rows for dynamic entities */
export const entityInstances = sqliteTable('entity_instances', {
  id: text('id').primaryKey(),
  entityName: text('entity_name').notNull(),
  slug: text('slug').notNull(),
  /** All entity field values as JSON */
  data: text('data').notNull().default('{}'),
  createdAt: text('created_at').default("(datetime('now'))"),
  updatedAt: text('updated_at').default("(datetime('now'))"),
}, (table) => [
  uniqueIndex('uniq_entity_instances_name_slug').on(table.entityName, table.slug),
])

/** Owner landing page configs (NOT SaaS — those are in landing_pages table) */
export const ownerLandingPages = sqliteTable('owner_landing_pages', {
  slug: text('slug').primaryKey(),
  title: text('title').notNull(),
  template: text('template'),
  /** Full LandingPageConfig as JSON */
  config: text('config').notNull().default('{}'),
  createdAt: text('created_at').default("(datetime('now'))"),
  updatedAt: text('updated_at').default("(datetime('now'))"),
})

/** Product configs — replaces src/content/products/*.yaml */
export const productConfigs = sqliteTable('product_configs', {
  slug: text('slug').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  icon: text('icon'),
  /** Full ProductConfig as JSON (features, coreCollections, etc.) */
  config: text('config').notNull().default('{}'),
  createdAt: text('created_at').default("(datetime('now'))"),
  updatedAt: text('updated_at').default("(datetime('now'))"),
})

/** Landing page templates — seed data, rarely written */
export const landingTemplates = sqliteTable('landing_templates', {
  name: text('name').primaryKey(),
  description: text('description'),
  targetAudience: text('target_audience'),
  /** Full template config as JSON */
  config: text('config').notNull().default('{}'),
})

/** Distribution log — append-only tracking for content distribution */
export const distributionLogs = sqliteTable('distribution_logs', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull(),
  contentType: text('content_type').notNull(),
  platforms: text('platforms').notNull().default('[]'),
  status: text('status').notNull().default('drafted'),
  wordCount: integer('word_count').default(0),
  notes: text('notes'),
  distributedAt: text('distributed_at').default("(datetime('now'))"),
}, (table) => [
  index('idx_distribution_slug').on(table.slug),
])
