/**
 * Tenant DB registry — stored in the SHARED Turso DB.
 * Each SaaS user gets their own isolated Turso DB; this table
 * tracks the credentials and provisioning status for each one.
 */
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { user } from './schema'

export const tenantDatabases = sqliteTable('tenant_databases', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique().references(() => user.id),
  dbName: text('db_name').notNull().unique(),
  dbUrl: text('db_url').notNull(),
  dbToken: text('db_token').notNull(),
  schemaVersion: integer('schema_version').notNull().default(1),
  /** 'provisioning' | 'ready' | 'error' */
  status: text('status').notNull().default('provisioning'),
  createdAt: text('created_at').default("(datetime('now'))"),
  updatedAt: text('updated_at').default("(datetime('now'))"),
})
