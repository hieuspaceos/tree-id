/**
 * Subscriber IO types — interface for email subscriber storage.
 */

export interface Subscriber {
  email: string
  subscribedAt: string
  token: string
}

export interface SubscriberIO {
  getAll(): Promise<Subscriber[]>
  isSubscribed(email: string): Promise<boolean>
  add(email: string): Promise<Subscriber | null>
  removeByToken(token: string): Promise<boolean>
  removeByEmail(email: string): Promise<boolean>
  getCount(): Promise<number>
}
