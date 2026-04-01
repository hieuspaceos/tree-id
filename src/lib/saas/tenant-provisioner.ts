/**
 * Turso Platform API integration for per-tenant DB provisioning.
 * Creates an isolated Turso DB per SaaS user, applies the content schema,
 * and stores credentials in the shared DB tenant_databases table.
 *
 * Env vars required:
 *   TURSO_PLATFORM_TOKEN — Turso Platform API token (not the DB auth token)
 *   TURSO_ORG           — Turso org slug (default: 'personal')
 *   TURSO_GROUP         — Turso group name (default: 'default')
 */
import { eq } from 'drizzle-orm'
import { createClient } from '@libsql/client'
import { getDb } from '@/db/client'
import { tenantDatabases } from '@/db/schema'
import { CONTENT_SCHEMA_SQL } from './tenant-content-schema-ddl'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TenantDbInfo {
  id: string
  userId: string
  dbName: string
  dbUrl: string
  dbToken: string
  schemaVersion: number
  status: string
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function getPlatformToken(): string {
  const token = process.env.TURSO_PLATFORM_TOKEN
  if (!token) throw new Error('TURSO_PLATFORM_TOKEN env var required')
  return token
}

function getOrg(): string {
  return process.env.TURSO_ORG ?? 'personal'
}

function getGroup(): string {
  return process.env.TURSO_GROUP ?? 'default'
}

function platformHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${getPlatformToken()}`,
    'Content-Type': 'application/json',
  }
}

/** Create a Turso DB via Platform API. Returns the DB hostname. */
async function createTursoDb(dbName: string): Promise<string> {
  const url = `https://api.turso.tech/v1/organizations/${getOrg()}/databases`
  const res = await fetch(url, {
    method: 'POST',
    headers: platformHeaders(),
    body: JSON.stringify({ name: dbName, group: getGroup() }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Turso create DB failed (${res.status}): ${body}`)
  }
  const data = (await res.json()) as { database: { Hostname: string } }
  return data.database.Hostname
}

/** Create a short-lived auth token for a tenant DB. */
async function createTursoToken(dbName: string): Promise<string> {
  const url = `https://api.turso.tech/v1/organizations/${getOrg()}/databases/${dbName}/auth/tokens`
  const res = await fetch(url, {
    method: 'POST',
    headers: platformHeaders(),
    body: JSON.stringify({ expiration: 'never', authorization: 'full-access' }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Turso create token failed (${res.status}): ${body}`)
  }
  const data = (await res.json()) as { jwt: string }
  return data.jwt
}

/** Apply content schema DDL to a newly provisioned tenant DB via raw libsql client. */
async function applyContentSchema(dbUrl: string, dbToken: string): Promise<void> {
  const client = createClient({ url: dbUrl, authToken: dbToken })
  // Split on statement boundaries and execute one at a time
  const statements = CONTENT_SCHEMA_SQL.split(';\n').map((s) => s.trim()).filter(Boolean)
  for (const stmt of statements) {
    await client.execute(stmt + ';')
  }
  client.close()
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Provision a new Turso DB for a user.
 * Idempotent — returns existing record if already provisioned.
 *
 * @param userId - Better Auth user ID
 * @returns TenantDbInfo with connection details and status
 */
export async function provisionTenantDb(userId: string): Promise<TenantDbInfo> {
  const db = getDb()

  // Check for existing record (idempotent)
  const existing = await db
    .select()
    .from(tenantDatabases)
    .where(eq(tenantDatabases.userId, userId))
    .get()

  if (existing) return existing as TenantDbInfo

  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 16)
  const dbName = `tt-${userId.slice(0, 12)}`

  // Insert provisioning placeholder so concurrent calls see it
  await db.insert(tenantDatabases).values({
    id,
    userId,
    dbName,
    dbUrl: '',
    dbToken: '',
    status: 'provisioning',
  })

  try {
    const hostname = await createTursoDb(dbName)
    const dbUrl = `libsql://${hostname}`
    const dbToken = await createTursoToken(dbName)

    await applyContentSchema(dbUrl, dbToken)

    await db
      .update(tenantDatabases)
      .set({ dbUrl, dbToken, status: 'ready', updatedAt: new Date().toISOString() })
      .where(eq(tenantDatabases.id, id))

    return { id, userId, dbName, dbUrl, dbToken, schemaVersion: 1, status: 'ready' }
  } catch (err) {
    await db
      .update(tenantDatabases)
      .set({ status: 'error', updatedAt: new Date().toISOString() })
      .where(eq(tenantDatabases.id, id))
    throw err
  }
}

/**
 * Look up tenant DB credentials for a user.
 * Returns null if not provisioned yet.
 */
export async function getTenantDbInfo(userId: string): Promise<TenantDbInfo | null> {
  const db = getDb()
  const row = await db
    .select()
    .from(tenantDatabases)
    .where(eq(tenantDatabases.userId, userId))
    .get()
  return (row as TenantDbInfo | undefined) ?? null
}
