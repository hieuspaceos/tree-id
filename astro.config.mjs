import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import markdoc from '@astrojs/markdoc'
import sitemap from '@astrojs/sitemap'
import cloudflare from '@astrojs/cloudflare'
import keystatic from '@keystatic/astro'
import pagefind from 'astro-pagefind'

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'http://localhost:4321',
  output: 'server',        // SSR default; static pages opt-in via `export const prerender = true`
  adapter: cloudflare({ platformProxy: { enabled: true } }),
  integrations: [
    react(),               // React islands (Toc)
    markdoc(),             // Keystatic Markdoc content
    keystatic(),           // Keystatic admin UI at /keystatic
    sitemap(),             // Auto sitemap.xml
    pagefind(),            // Static search index
  ],
  vite: {
    ssr: {
      // better-sqlite3 is a native Node module — exclude from Cloudflare Workers SSR bundle
      external: ['better-sqlite3'],
    },
  },
})
