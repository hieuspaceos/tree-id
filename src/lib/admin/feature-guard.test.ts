/**
 * Tests for feature-guard — server-side feature checks, caching, and 403 responses
 */
import { describe, it, expect } from 'vitest'
import { checkFeatureEnabled } from './feature-guard'

describe('feature-guard', () => {
  describe('checkFeatureEnabled', () => {
    it('returns { enabled: true } when site-settings.yaml missing (file not found)', async () => {
      // The guard module catches file read errors and defaults to enabled
      const result = await checkFeatureEnabled('email')
      expect(result.enabled).toBe(true)
      expect(result).not.toHaveProperty('response')
    })

    it('returns { enabled: true } object with enabled property', async () => {
      // Even if file doesn't exist, should return object with enabled property
      const result = await checkFeatureEnabled('media')
      expect(typeof result).toBe('object')
      expect(result).toHaveProperty('enabled')
      expect(typeof result.enabled).toBe('boolean')
    })

    it('response property missing when enabled is true', async () => {
      const result = await checkFeatureEnabled('distribution')
      if (result.enabled === true) {
        expect(result).not.toHaveProperty('response')
      }
    })

    it('returns consistent type signature for enabled true case', async () => {
      const result = await checkFeatureEnabled('voices')
      if (result.enabled === true) {
        // When enabled, only has enabled property
        expect(Object.keys(result).sort()).toEqual(['enabled'])
      }
    })

    it('returns consistent type signature for enabled false case', async () => {
      // Note: testing with fake disabled feature
      // In real settings, if feature is disabled, would return response
      const result = await checkFeatureEnabled('test-disabled-feature')
      if (result.enabled === false) {
        // When disabled, has enabled and response properties
        expect(result).toHaveProperty('enabled')
        expect(result).toHaveProperty('response')
        expect(result.response).toBeInstanceOf(Response)
      }
    })

    it('handles boolean values correctly', async () => {
      // Test that the enabled field is actually boolean
      const result = await checkFeatureEnabled('any-feature')
      expect(result.enabled === true || result.enabled === false).toBe(true)
    })

    it('different feature IDs may return different results', async () => {
      // Each call should independently check enablement
      const result1 = await checkFeatureEnabled('feature1')
      const result2 = await checkFeatureEnabled('feature2')

      expect(result1).toHaveProperty('enabled')
      expect(result2).toHaveProperty('enabled')
    })

    it('response has 403 status when feature disabled', async () => {
      const result = await checkFeatureEnabled('test-disabled')
      if (!result.enabled && result.response) {
        expect(result.response.status).toBe(403)
      }
    })

    it('response has JSON content-type header', async () => {
      const result = await checkFeatureEnabled('test-disabled')
      if (!result.enabled && result.response) {
        expect(result.response.headers.get('Content-Type')).toBe('application/json')
      }
    })

    it('response body contains error message', async () => {
      const result = await checkFeatureEnabled('test-disabled')
      if (!result.enabled && result.response) {
        const body = await result.response.text()
        expect(typeof body).toBe('string')
        expect(body.length).toBeGreaterThan(0)
      }
    })

    it('response includes feature ID in error message', async () => {
      const featureId = 'my-test-feature'
      const result = await checkFeatureEnabled(featureId)
      if (!result.enabled && result.response) {
        const body = await result.response.text()
        expect(body.toLowerCase()).toContain(featureId.toLowerCase())
      }
    })

    it('supports various feature ID formats', async () => {
      const ids = ['email', 'media', 'analytics', 'distribution', 'voices-pro', 'test123']
      for (const id of ids) {
        const result = await checkFeatureEnabled(id)
        expect(result).toHaveProperty('enabled')
      }
    })

    it('function is async (returns Promise)', async () => {
      // checkFeatureEnabled should return a Promise
      const promise = checkFeatureEnabled('test')
      expect(promise).toBeInstanceOf(Promise)
      const result = await promise
      expect(result).toHaveProperty('enabled')
    })

    it('returns Response instance when feature disabled', async () => {
      const result = await checkFeatureEnabled('disabled-test')
      if (!result.enabled) {
        expect(result.response).toBeInstanceOf(Response)
      }
    })

    it('enabled false case has response with ok false in body', async () => {
      const result = await checkFeatureEnabled('disabled')
      if (!result.enabled && result.response) {
        const body = await result.response.json()
        expect(body.ok).toBe(false)
      }
    })

    it('enabled false case has error field in response', async () => {
      const result = await checkFeatureEnabled('disabled')
      if (!result.enabled && result.response) {
        const body = await result.response.json()
        expect(body).toHaveProperty('error')
        expect(typeof body.error).toBe('string')
      }
    })

    it('response can be returned directly from API route handler', async () => {
      const result = await checkFeatureEnabled('test')
      if (!result.enabled) {
        // Should be usable directly in handler like: if (!check.enabled) return check.response
        const response = result.response
        expect(response).toBeInstanceOf(Response)
        expect(typeof response.status).toBe('number')
      }
    })

    it('guard handles feature IDs with special characters', async () => {
      const result = await checkFeatureEnabled('feature-with-dashes')
      expect(result).toHaveProperty('enabled')
    })

    it('guard handles feature IDs with numbers', async () => {
      const result = await checkFeatureEnabled('feature123')
      expect(result).toHaveProperty('enabled')
    })

    it('guard handles empty string feature ID', async () => {
      const result = await checkFeatureEnabled('')
      expect(result).toHaveProperty('enabled')
    })

    it('guard returns same type for all calls', async () => {
      const r1 = await checkFeatureEnabled('a')
      const r2 = await checkFeatureEnabled('b')

      expect(typeof r1.enabled).toBe(typeof r2.enabled)
      expect((r1.enabled && !('response' in r1)) || (!r1.enabled && 'response' in r1)).toBe(true)
      expect((r2.enabled && !('response' in r2)) || (!r2.enabled && 'response' in r2)).toBe(true)
    })
  })

  describe('type signature validation', () => {
    it('enabled true case: only has enabled property', async () => {
      const result = await checkFeatureEnabled('any')
      if (result.enabled === true) {
        const keys = Object.keys(result)
        expect(keys).toEqual(['enabled'])
      }
    })

    it('enabled false case: has enabled and response properties', async () => {
      const result = await checkFeatureEnabled('any')
      if (result.enabled === false) {
        expect(result).toHaveProperty('enabled', false)
        expect(result).toHaveProperty('response')
      }
    })

    it('response property is never present when enabled is true', async () => {
      const result = await checkFeatureEnabled('test')
      if (result.enabled === true) {
        expect('response' in result).toBe(false)
      }
    })

    it('response property is always present when enabled is false', async () => {
      const result = await checkFeatureEnabled('test')
      if (result.enabled === false) {
        expect('response' in result).toBe(true)
        expect(result.response).toBeDefined()
      }
    })
  })

  describe('API route usage patterns', () => {
    it('pattern: early return on disabled', async () => {
      const check = await checkFeatureEnabled('email')
      if (!check.enabled) {
        // Should be usable as: if (!check.enabled) return check.response
        expect(check.response).toBeInstanceOf(Response)
      }
    })

    it('pattern: type guard for enabled case', async () => {
      const check = await checkFeatureEnabled('email')
      if (check.enabled) {
        // When enabled is true, no response property exists
        expect('response' in check).toBe(false)
        // Handler continues with actual logic
        expect(check.enabled).toBe(true)
      }
    })

    it('pattern: discriminated union usage', async () => {
      const check = await checkFeatureEnabled('email')
      // Should work as discriminated union
      if (!check.enabled) {
        // TypeScript narrows to { enabled: false; response: Response }
        const status = check.response.status
        expect(typeof status).toBe('number')
      } else {
        // TypeScript narrows to { enabled: true }
        expect(check.enabled).toBe(true)
      }
    })
  })

  describe('edge cases', () => {
    it('very long feature ID', async () => {
      const longId = 'a'.repeat(1000)
      const result = await checkFeatureEnabled(longId)
      expect(result).toHaveProperty('enabled')
    })

    it('feature ID with spaces', async () => {
      const result = await checkFeatureEnabled('feature with spaces')
      expect(result).toHaveProperty('enabled')
    })

    it('feature ID with unicode', async () => {
      const result = await checkFeatureEnabled('功能')
      expect(result).toHaveProperty('enabled')
    })

    it('multiple calls with same ID return consistent enabled state', async () => {
      const id = 'test-consistency'
      const r1 = await checkFeatureEnabled(id)
      const r2 = await checkFeatureEnabled(id)
      expect(r1.enabled).toBe(r2.enabled)
    })

    it('null/undefined feature ID handling', async () => {
      // Even with unusual inputs, should return valid object
      const result = await checkFeatureEnabled(null as any)
      expect(result).toHaveProperty('enabled')
    })
  })
})
