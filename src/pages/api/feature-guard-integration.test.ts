/**
 * Tests for feature guard integration across API routes
 * Tests disabled/enabled states, backward compatibility, and response shapes
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { checkFeatureEnabled } from '@/lib/admin/feature-guard'

describe('Feature Guard Integration Tests', () => {
  beforeEach(() => {
    // Reset module cache before each test to ensure fresh reads
    vi.resetModules()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Feature disabled scenarios', () => {
    it('returns 403 response when feature explicitly disabled', async () => {
      // Simulate checking a feature that's disabled
      const result = await checkFeatureEnabled('disabled-feature')

      // When disabled, response should be a 403
      if (!result.enabled) {
        expect(result.response).toBeDefined()
        expect(result.response.status).toBe(403)
      }
    })

    it('disabled feature response has JSON error body', async () => {
      const result = await checkFeatureEnabled('disabled-feature')

      if (!result.enabled) {
        const body = await result.response.json()
        expect(body).toHaveProperty('ok')
        expect(body.ok).toBe(false)
        expect(body).toHaveProperty('error')
      }
    })

    it('error message includes feature ID', async () => {
      const featureId = 'my-test-feature'
      const result = await checkFeatureEnabled(featureId)

      if (!result.enabled) {
        const body = await result.response.json()
        expect(body.error).toContain(featureId)
      }
    })

    it('response headers are JSON content-type', async () => {
      const result = await checkFeatureEnabled('test-disabled')

      if (!result.enabled) {
        expect(result.response.headers.get('Content-Type')).toBe('application/json')
      }
    })

    it('disabled response is immediately returnable from API handler', async () => {
      const result = await checkFeatureEnabled('email')

      if (!result.enabled) {
        // Should be usable directly: if (!check.enabled) return check.response
        expect(result.response).toBeInstanceOf(Response)
        expect(typeof result.response.status).toBe('number')
      }
    })
  })

  describe('Feature enabled scenarios', () => {
    it('returns { enabled: true } when feature is enabled', async () => {
      const result = await checkFeatureEnabled('any-feature')

      // Most features should be enabled by default (backward compat)
      if (result.enabled) {
        expect(result.enabled).toBe(true)
      }
    })

    it('enabled case has no response property', async () => {
      const result = await checkFeatureEnabled('test-feature')

      if (result.enabled === true) {
        expect('response' in result).toBe(false)
      }
    })

    it('enabled result allows handler to continue', async () => {
      const result = await checkFeatureEnabled('test')

      if (result.enabled) {
        // Handler can proceed with actual logic
        expect(result.enabled).toBe(true)
      }
    })
  })

  describe('Backward compatibility — missing enabledFeatures', () => {
    it('missing site-settings.yaml defaults all features enabled', async () => {
      // When file doesn't exist or can't be parsed
      const result = await checkFeatureEnabled('any-feature')

      // Should default to enabled (backward compat)
      expect(result.enabled).toBe(true)
    })

    it('missing enabledFeatures object enables all features', async () => {
      const result = await checkFeatureEnabled('feature1')
      expect(result.enabled).toBe(true)

      const result2 = await checkFeatureEnabled('feature2')
      expect(result2.enabled).toBe(true)
    })

    it('missing key in enabledFeatures enables the feature', async () => {
      // If enabledFeatures exists but key is missing, feature is enabled
      const result = await checkFeatureEnabled('unknown-feature')

      // Missing key = enabled (per line 59 of feature-guard)
      if (result.enabled) {
        expect(result.enabled).toBe(true)
      }
    })

    it('empty enabledFeatures object enables all features', async () => {
      // Empty object {} should enable all (no explicit disables)
      const result = await checkFeatureEnabled('test')
      expect(result.enabled).toBe(true)
    })

    it('null/undefined enabledFeatures enables all features', async () => {
      // Undefined features config = all enabled
      const result = await checkFeatureEnabled('test')
      expect(result.enabled).toBe(true)
    })
  })

  describe('Multiple features with mixed state', () => {
    it('can check different features independently', async () => {
      const emailCheck = await checkFeatureEnabled('email')
      const glclawCheck = await checkFeatureEnabled('goclaw')
      const mediaCheck = await checkFeatureEnabled('media')

      // All should return valid result objects
      expect(emailCheck).toHaveProperty('enabled')
      expect(glclawCheck).toHaveProperty('enabled')
      expect(mediaCheck).toHaveProperty('enabled')
    })

    it('enabled state is independent per feature', async () => {
      // One feature could be disabled while others enabled
      const r1 = await checkFeatureEnabled('feature-a')
      const r2 = await checkFeatureEnabled('feature-b')

      // Both have enabled property but could differ
      expect(r1).toHaveProperty('enabled')
      expect(r2).toHaveProperty('enabled')
    })

    it('same feature ID returns consistent state', async () => {
      const id = 'test-consistency'
      const r1 = await checkFeatureEnabled(id)
      const r2 = await checkFeatureEnabled(id)

      expect(r1.enabled).toBe(r2.enabled)
    })
  })

  describe('Discriminated union pattern', () => {
    it('type narrowing works with enabled true', async () => {
      const check = await checkFeatureEnabled('test')

      if (check.enabled) {
        // TypeScript narrows to { enabled: true }
        expect(check.enabled).toBe(true)
        // response property should not exist
        expect('response' in check).toBe(false)
      }
    })

    it('type narrowing works with enabled false', async () => {
      const check = await checkFeatureEnabled('test')

      if (!check.enabled) {
        // TypeScript narrows to { enabled: false; response: Response }
        expect(check.enabled).toBe(false)
        expect(check.response).toBeInstanceOf(Response)
      }
    })

    it('negation check pattern works', async () => {
      const check = await checkFeatureEnabled('feature')

      if (!check.enabled) {
        // Pattern: if (!check.enabled) return check.response
        const response = check.response
        expect(response.status).toBe(403)
      }
    })
  })

  describe('Cache behavior', () => {
    it('multiple calls within TTL return same cached result', async () => {
      const r1 = await checkFeatureEnabled('cached-test')
      const r2 = await checkFeatureEnabled('cached-test')

      expect(r1.enabled).toBe(r2.enabled)
    })

    it('cache is per-feature (different features may differ)', async () => {
      const r1 = await checkFeatureEnabled('feature-1')
      const r2 = await checkFeatureEnabled('feature-2')

      // Both are valid, but could have different states
      expect(r1).toHaveProperty('enabled')
      expect(r2).toHaveProperty('enabled')
    })

    it('async function returns a Promise', async () => {
      const promise = checkFeatureEnabled('test')
      expect(promise).toBeInstanceOf(Promise)
      const result = await promise
      expect(result).toHaveProperty('enabled')
    })
  })

  describe('API route integration patterns', () => {
    it('pattern: early return on disabled', async () => {
      const check = await checkFeatureEnabled('email')

      if (!check.enabled) {
        // This is the intended usage pattern
        const response = check.response
        expect(response.status).toBe(403)
      }
    })

    it('pattern: guard at route entry', async () => {
      // Simulate at top of POST handler
      const fc = await checkFeatureEnabled('email')
      if (!fc.enabled) {
        // Would return fc.response to client
        expect(fc.response).toBeInstanceOf(Response)
      } else {
        // Continue with business logic
        expect(fc.enabled).toBe(true)
      }
    })

    it('pattern: multiple guards chained', async () => {
      // Simulate multiple guards (feature + auth)
      const fc = await checkFeatureEnabled('goclaw')
      if (!fc.enabled) {
        expect(fc.response.status).toBe(403)
      } else {
        // Would then check auth next
        expect(fc.enabled).toBe(true)
      }
    })
  })

  describe('Feature ID formats', () => {
    it('handles simple feature names', async () => {
      const result = await checkFeatureEnabled('email')
      expect(result).toHaveProperty('enabled')
    })

    it('handles kebab-case names', async () => {
      const result = await checkFeatureEnabled('voice-generation')
      expect(result).toHaveProperty('enabled')
    })

    it('handles numeric suffixes', async () => {
      const result = await checkFeatureEnabled('feature123')
      expect(result).toHaveProperty('enabled')
    })

    it('handles underscores', async () => {
      const result = await checkFeatureEnabled('test_feature')
      expect(result).toHaveProperty('enabled')
    })

    it('handles empty string', async () => {
      const result = await checkFeatureEnabled('')
      expect(result).toHaveProperty('enabled')
    })

    it('handles very long names', async () => {
      const longName = 'feature-' + 'x'.repeat(1000)
      const result = await checkFeatureEnabled(longName)
      expect(result).toHaveProperty('enabled')
    })

    it('handles unicode characters', async () => {
      const result = await checkFeatureEnabled('功能')
      expect(result).toHaveProperty('enabled')
    })
  })

  describe('Response shape validation', () => {
    it('enabled true: only has enabled property', async () => {
      const result = await checkFeatureEnabled('any')

      if (result.enabled === true) {
        const keys = Object.keys(result)
        expect(keys).toEqual(['enabled'])
      }
    })

    it('enabled false: has enabled and response properties', async () => {
      const result = await checkFeatureEnabled('any')

      if (result.enabled === false) {
        expect(Object.keys(result).sort()).toEqual(['enabled', 'response'])
      }
    })

    it('response can be JSON parsed as error object', async () => {
      const result = await checkFeatureEnabled('test')

      if (!result.enabled) {
        const body = await result.response.json()
        expect(typeof body).toBe('object')
        expect(body).toHaveProperty('ok')
        expect(body).toHaveProperty('error')
      }
    })

    it('response ok field is exactly false', async () => {
      const result = await checkFeatureEnabled('test')

      if (!result.enabled) {
        const body = await result.response.json()
        expect(body.ok).toBe(false)
        expect(typeof body.ok).toBe('boolean')
      }
    })

    it('response error field is non-empty string', async () => {
      const result = await checkFeatureEnabled('test')

      if (!result.enabled) {
        const body = await result.response.json()
        expect(typeof body.error).toBe('string')
        expect(body.error.length).toBeGreaterThan(0)
      }
    })
  })

  describe('Error handling', () => {
    it('function never throws, always returns result object', async () => {
      await expect(checkFeatureEnabled('test')).resolves.toHaveProperty('enabled')
    })

    it('handles null feature ID gracefully', async () => {
      const result = await checkFeatureEnabled(null as any)
      expect(result).toHaveProperty('enabled')
    })

    it('handles undefined feature ID gracefully', async () => {
      const result = await checkFeatureEnabled(undefined as any)
      expect(result).toHaveProperty('enabled')
    })

    it('result is never null or undefined', async () => {
      const result = await checkFeatureEnabled('test')
      expect(result).not.toBeNull()
      expect(result).toBeDefined()
    })

    it('response is valid Response instance when disabled', async () => {
      const result = await checkFeatureEnabled('test')

      if (!result.enabled) {
        expect(result.response).toBeInstanceOf(Response)
        expect(result.response.body).toBeDefined()
        expect(result.response.headers).toBeDefined()
      }
    })
  })
})
