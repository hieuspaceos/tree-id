/**
 * TursoSubscriberIO — email subscribers via Turso DB.
 */
import { eq } from 'drizzle-orm'
import { getDb } from '@/db/client'
import { subscribers } from '@/db/schema-content'
import type { SubscriberIO, Subscriber } from './subscriber-io-types'

export class TursoSubscriberIO implements SubscriberIO {
  private db: ReturnType<typeof getDb>
  constructor(db?: ReturnType<typeof getDb>) { this.db = db || getDb() }

  async getAll(): Promise<Subscriber[]> {
    const rows = await this.db.select().from(subscribers)
    return rows.map(r => ({ email: r.email, token: r.token, subscribedAt: r.subscribedAt || '' }))
      .sort((a, b) => b.subscribedAt.localeCompare(a.subscribedAt))
  }

  async isSubscribed(email: string): Promise<boolean> {
    const [row] = await this.db.select({ email: subscribers.email }).from(subscribers)
      .where(eq(subscribers.email, email.toLowerCase().trim()))
    return !!row
  }

  async add(email: string): Promise<Subscriber | null> {
    const normalized = email.toLowerCase().trim()
    if (await this.isSubscribed(normalized)) return null
    const sub: Subscriber = {
      email: normalized,
      subscribedAt: new Date().toISOString(),
      token: crypto.randomUUID().replace(/-/g, ''),
    }
    await this.db.insert(subscribers).values({
      id: crypto.randomUUID(), email: sub.email, token: sub.token, subscribedAt: sub.subscribedAt,
    }).onConflictDoNothing()
    return sub
  }

  async removeByToken(token: string): Promise<boolean> {
    const result = await this.db.delete(subscribers).where(eq(subscribers.token, token))
    return (result as any).rowsAffected > 0
  }

  async removeByEmail(email: string): Promise<boolean> {
    const result = await this.db.delete(subscribers).where(eq(subscribers.email, email.toLowerCase().trim()))
    return (result as any).rowsAffected > 0
  }

  async getCount(): Promise<number> {
    const rows = await this.db.select({ email: subscribers.email }).from(subscribers)
    return rows.length
  }
}
