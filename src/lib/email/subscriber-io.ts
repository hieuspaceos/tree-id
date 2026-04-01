/**
 * Subscriber IO barrel — re-exports local functions (backward compat) + factory.
 */
export type { Subscriber, SubscriberIO } from './subscriber-io-types'

// Backward-compat: re-export all functions from local implementation
export {
  setSubscribersDir, getAllSubscribers, isSubscribed, addSubscriber,
  removeByToken, removeByEmail, getSubscriberCount,
} from './subscriber-io-local'

import type { SubscriberIO } from './subscriber-io-types'
import { TursoSubscriberIO } from './subscriber-io-turso'
import * as local from './subscriber-io-local'

// ── Factory ──

let _instance: SubscriberIO | null = null

/** Get SubscriberIO: TursoIO (prod+Turso) or async-wrapped local (dev) */
export function getSubscriberIO(db?: any): SubscriberIO {
  if (db) return new TursoSubscriberIO(db)
  if (_instance) return _instance
  if (import.meta.env.PROD && import.meta.env.TURSO_URL) {
    _instance = new TursoSubscriberIO()
  } else {
    _instance = {
      getAll: async () => local.getAllSubscribers(),
      isSubscribed: async (email) => local.isSubscribed(email),
      add: async (email) => local.addSubscriber(email),
      removeByToken: async (token) => local.removeByToken(token),
      removeByEmail: async (email) => local.removeByEmail(email),
      getCount: async () => local.getSubscriberCount(),
    }
  }
  return _instance
}
