/**
 * Tests for admin authentication — password hashing, JWT tokens, cookie builders
 */
import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import {
  hashPassword,
  verifyPassword,
  authenticateUser,
  isMultiUserMode,
  signToken,
  verifyToken,
  buildSessionCookie,
  buildClearCookie,
  COOKIE_NAME,
  COOKIE_MAX_AGE,
} from './auth'

// JWT requires ADMIN_SECRET to be set
beforeAll(() => {
  process.env.ADMIN_SECRET = 'test-secret-must-be-at-least-32-chars-long'
})

// Clean up env vars between tests to avoid cross-contamination
afterEach(() => {
  delete process.env.ADMIN_USERS
  delete process.env.ADMIN_PASSWORD
  delete process.env.ADMIN_PASSWORD_HASH
})

describe('hashPassword + verifyPassword', () => {
  it('round-trips correctly — hash then verify returns true', async () => {
    const hash = await hashPassword('my-password-123')
    expect(hash).toMatch(/^[0-9a-f]+:[0-9a-f]+$/) // salt:hash format
    const valid = await verifyPassword('my-password-123', hash)
    expect(valid).toBe(true)
  })

  it('rejects wrong password', async () => {
    const hash = await hashPassword('correct-password')
    const valid = await verifyPassword('wrong-password', hash)
    expect(valid).toBe(false)
  })

  it('rejects malformed hash string', async () => {
    expect(await verifyPassword('test', 'not-a-hash')).toBe(false)
    expect(await verifyPassword('test', '')).toBe(false)
  })

  it('generates unique salts per hash', async () => {
    const h1 = await hashPassword('same-pass')
    const h2 = await hashPassword('same-pass')
    const [salt1] = h1.split(':')
    const [salt2] = h2.split(':')
    expect(salt1).not.toBe(salt2) // different salts
  })
})

describe('authenticateUser', () => {
  it('single-user mode — correct password returns admin', async () => {
    delete process.env.ADMIN_USERS
    process.env.ADMIN_PASSWORD = 'secret123'
    const result = await authenticateUser('secret123')
    expect(result).toEqual({ username: 'admin', role: 'admin' })
  })

  it('single-user mode — wrong password returns null', async () => {
    delete process.env.ADMIN_USERS
    process.env.ADMIN_PASSWORD = 'secret123'
    const result = await authenticateUser('wrong')
    expect(result).toBeNull()
  })

  it('single-user mode — no ADMIN_PASSWORD returns null', async () => {
    delete process.env.ADMIN_USERS
    delete process.env.ADMIN_PASSWORD
    delete process.env.ADMIN_PASSWORD_HASH
    const result = await authenticateUser('anything')
    expect(result).toBeNull()
  })

  it('multi-user mode — valid user returns role', async () => {
    process.env.ADMIN_USERS = JSON.stringify([
      { username: 'alice', password: 'pass1', role: 'admin' },
      { username: 'bob', password: 'pass2', role: 'editor' },
    ])
    const alice = await authenticateUser('pass1', 'alice')
    expect(alice).toEqual({ username: 'alice', role: 'admin' })
    const bob = await authenticateUser('pass2', 'bob')
    expect(bob).toEqual({ username: 'bob', role: 'editor' })
  })

  it('multi-user mode — wrong password returns null', async () => {
    process.env.ADMIN_USERS = JSON.stringify([
      { username: 'alice', password: 'pass1', role: 'admin' },
    ])
    const result = await authenticateUser('wrong', 'alice')
    expect(result).toBeNull()
  })

  it('multi-user mode — unknown user returns null', async () => {
    process.env.ADMIN_USERS = JSON.stringify([
      { username: 'alice', password: 'pass1', role: 'admin' },
    ])
    const result = await authenticateUser('pass1', 'unknown')
    expect(result).toBeNull()
  })

  it('multi-user mode — no username returns null', async () => {
    process.env.ADMIN_USERS = JSON.stringify([
      { username: 'alice', password: 'pass1', role: 'admin' },
    ])
    const result = await authenticateUser('pass1')
    expect(result).toBeNull()
  })
})

describe('isMultiUserMode', () => {
  it('returns true when ADMIN_USERS is valid JSON array', () => {
    process.env.ADMIN_USERS = JSON.stringify([{ username: 'a', password: 'b', role: 'admin' }])
    expect(isMultiUserMode()).toBe(true)
  })

  it('returns false when ADMIN_USERS not set', () => {
    delete process.env.ADMIN_USERS
    expect(isMultiUserMode()).toBe(false)
  })

  it('returns false for invalid JSON', () => {
    process.env.ADMIN_USERS = 'not-json'
    expect(isMultiUserMode()).toBe(false)
  })

  it('returns false for empty array', () => {
    process.env.ADMIN_USERS = '[]'
    expect(isMultiUserMode()).toBe(false)
  })
})

describe('signToken + verifyToken', () => {
  it('round-trips — sign then verify returns payload', async () => {
    const token = await signToken({ username: 'admin', role: 'admin' })
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3) // JWT format

    const payload = await verifyToken(token)
    expect(payload).not.toBeNull()
    expect(payload!.username).toBe('admin')
    expect(payload!.role).toBe('admin')
  })

  it('rejects tampered token', async () => {
    const token = await signToken({ username: 'admin' })
    const tampered = token.slice(0, -5) + 'xxxxx'
    const result = await verifyToken(tampered)
    expect(result).toBeNull()
  })

  it('rejects empty/garbage token', async () => {
    expect(await verifyToken('')).toBeNull()
    expect(await verifyToken('not.a.jwt')).toBeNull()
  })
})

describe('buildSessionCookie', () => {
  it('contains cookie name and token', () => {
    const cookie = buildSessionCookie('my-token-abc')
    expect(cookie).toContain(`${COOKIE_NAME}=my-token-abc`)
  })

  it('has HttpOnly and SameSite=Strict flags', () => {
    const cookie = buildSessionCookie('tok')
    expect(cookie).toContain('HttpOnly')
    expect(cookie).toContain('SameSite=Strict')
  })

  it('has correct MaxAge', () => {
    const cookie = buildSessionCookie('tok')
    expect(cookie).toContain(`Max-Age=${COOKIE_MAX_AGE}`)
  })
})

describe('buildClearCookie', () => {
  it('sets Max-Age=0 to clear cookie', () => {
    const cookie = buildClearCookie()
    expect(cookie).toContain(`${COOKIE_NAME}=`)
    expect(cookie).toContain('Max-Age=0')
  })
})
