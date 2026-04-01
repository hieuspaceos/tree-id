/**
 * Raw SQL DDL for content tables applied to every newly provisioned tenant DB.
 * Mirrors src/db/schema-content.ts — must be kept in sync if schema changes.
 * Executed statement-by-statement via @libsql/client on first-provision.
 */

export const CONTENT_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS content_entries (
  id TEXT PRIMARY KEY,
  collection TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  description TEXT DEFAULT '',
  body TEXT,
  metadata TEXT NOT NULL DEFAULT '{}',
  published_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_content_collection_slug ON content_entries(collection, slug);
CREATE INDEX IF NOT EXISTS idx_content_collection_status ON content_entries(collection, status);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  token TEXT NOT NULL UNIQUE,
  subscribed_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_token ON subscribers(token);

CREATE TABLE IF NOT EXISTS entity_definitions (
  name TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT,
  fields TEXT NOT NULL DEFAULT '[]',
  public_config TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS entity_instances (
  id TEXT PRIMARY KEY,
  entity_name TEXT NOT NULL,
  slug TEXT NOT NULL,
  data TEXT NOT NULL DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_entity_instances_name_slug ON entity_instances(entity_name, slug);

CREATE TABLE IF NOT EXISTS owner_landing_pages (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  template TEXT,
  config TEXT NOT NULL DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS product_configs (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  config TEXT NOT NULL DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS landing_templates (
  name TEXT PRIMARY KEY,
  description TEXT,
  target_audience TEXT,
  config TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS distribution_logs (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  content_type TEXT NOT NULL,
  platforms TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'drafted',
  word_count INTEGER DEFAULT 0,
  notes TEXT,
  distributed_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_distribution_slug ON distribution_logs(slug);
`.trim()
