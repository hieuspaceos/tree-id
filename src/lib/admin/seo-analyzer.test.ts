/**
 * Tests for SEO analyzer — scoring logic for RankMath-style article analysis
 */
import { describe, it, expect } from 'vitest'
import { analyzeSeo } from './seo-analyzer'

describe('analyzeSeo', () => {
  it('returns 0 score for empty input', () => {
    const result = analyzeSeo({})
    expect(result.score).toBe(0)
    expect(result.checks.length).toBeGreaterThan(0)
    expect(result.checks.every((c) => !c.pass)).toBe(true)
  })

  it('scores high for well-optimized article', () => {
    const result = analyzeSeo({
      title: 'Best JavaScript frameworks for 2026',
      description: 'A comprehensive guide to the best JavaScript frameworks available in 2026, covering React, Vue, Svelte and more for modern web development.',
      slug: 'best-javascript-frameworks-2026',
      content: `## Why JavaScript frameworks matter\n\nJavaScript frameworks help developers build modern web apps efficiently.\n\n## Top JavaScript frameworks\n\nReact remains the most popular JavaScript framework.\n\n## How to choose a JavaScript framework\n\nConsider your team size and project requirements.\n\n![Chart](/images/chart.png)\n\n${'Lorem ipsum dolor sit amet. '.repeat(50)}`,
      seo: { focusKeyword: 'javascript frameworks', seoTitle: 'Top JS Frameworks 2026 | Guide' },
      cover: { url: '/cover.jpg', alt: 'JavaScript frameworks comparison' },
      tags: ['javascript', 'frameworks', 'web-dev'],
      links: { outbound: ['/articles/react-guide'] },
    })
    // Well-optimized article should score significantly
    expect(result.score).toBeGreaterThan(60)
  })

  it('checks title length — too short fails', () => {
    const result = analyzeSeo({ title: 'Short' })
    const titleCheck = result.checks.find((c) => c.id === 'title-len')
    expect(titleCheck).toBeDefined()
    expect(titleCheck!.pass).toBe(false)
  })

  it('checks title length — optimal passes', () => {
    const result = analyzeSeo({ title: 'A well-crafted title for SEO optimization' })
    const titleCheck = result.checks.find((c) => c.id === 'title-len')
    expect(titleCheck!.pass).toBe(true)
  })

  it('checks description length — missing fails', () => {
    const result = analyzeSeo({ description: '' })
    const descCheck = result.checks.find((c) => c.id === 'desc-len')
    expect(descCheck!.pass).toBe(false)
  })

  it('checks description length — 120-160 chars passes', () => {
    const desc = 'A'.repeat(140)
    const result = analyzeSeo({ description: desc })
    const descCheck = result.checks.find((c) => c.id === 'desc-len')
    expect(descCheck!.pass).toBe(true)
  })

  it('checks content word count — thin content fails', () => {
    const result = analyzeSeo({ content: 'Just a few words here.' })
    const lenCheck = result.checks.find((c) => c.id === 'content-len')
    expect(lenCheck!.pass).toBe(false)
  })

  it('checks content word count — 600+ words passes', () => {
    const content = 'word '.repeat(650)
    const result = analyzeSeo({ content })
    const lenCheck = result.checks.find((c) => c.id === 'content-len')
    expect(lenCheck!.pass).toBe(true)
  })

  it('checks heading extraction', () => {
    const content = '## First heading\n\nSome text\n\n### Sub heading\n\nMore text\n\n## Another heading'
    const result = analyzeSeo({ content })
    const headCheck = result.checks.find((c) => c.id === 'has-headings')
    expect(headCheck!.pass).toBe(true)
    const tocCheck = result.checks.find((c) => c.id === 'toc-worthy')
    expect(tocCheck!.pass).toBe(true) // 3 headings
  })

  it('checks image detection', () => {
    const withImg = analyzeSeo({ content: 'Text ![alt](url) more text' })
    expect(withImg.checks.find((c) => c.id === 'has-images')!.pass).toBe(true)

    const noImg = analyzeSeo({ content: 'Just plain text no images' })
    expect(noImg.checks.find((c) => c.id === 'has-images')!.pass).toBe(false)
  })

  it('checks focus keyword in title', () => {
    const result = analyzeSeo({
      title: 'Learn TypeScript basics',
      seo: { focusKeyword: 'typescript' },
    })
    const kwTitle = result.checks.find((c) => c.id === 'kw-title')
    expect(kwTitle!.pass).toBe(true)
  })

  it('checks cover image and alt text', () => {
    const withCover = analyzeSeo({ cover: { url: '/img.jpg', alt: 'Description' } })
    expect(withCover.checks.find((c) => c.id === 'cover-set')!.pass).toBe(true)
    expect(withCover.checks.find((c) => c.id === 'cover-alt')!.pass).toBe(true)

    const noCover = analyzeSeo({ cover: {} })
    expect(noCover.checks.find((c) => c.id === 'cover-set')!.pass).toBe(false)
  })

  it('checks tags', () => {
    const withTags = analyzeSeo({ tags: ['js', 'web'] })
    expect(withTags.checks.find((c) => c.id === 'tags-set')!.pass).toBe(true)

    const noTags = analyzeSeo({ tags: [] })
    expect(noTags.checks.find((c) => c.id === 'tags-set')!.pass).toBe(false)
  })

  it('total score is sum of individual check scores', () => {
    const result = analyzeSeo({ title: 'Test', content: 'text' })
    const expectedTotal = result.checks.reduce((sum, c) => sum + c.score, 0)
    expect(result.score).toBe(expectedTotal)
  })
})
