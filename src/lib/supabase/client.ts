/**
 * Supabase client factory — server-side and browser-side clients.
 * Server client uses service role key for admin operations.
 * Browser client uses anon key (RLS enforces access).
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database-types'

/** Server-side client — use in API routes, middleware. Has full access. */
export function createServerSupabase(): SupabaseClient<Database> {
  const url = import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase server env vars')
  return createClient<Database>(url, key)
}

/** Browser-side client — use in React islands. RLS enforced. */
export function createBrowserSupabase(): SupabaseClient<Database> {
  const url = import.meta.env.PUBLIC_SUPABASE_URL
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Missing Supabase browser env vars')
  return createClient<Database>(url, key)
}
