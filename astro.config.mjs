import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import markdoc from '@astrojs/markdoc'
import sitemap from '@astrojs/sitemap'
import vercel from '@astrojs/vercel'
import keystatic from '@keystatic/astro'
import pagefind from 'astro-pagefind'

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'http://localhost:4321',
  output: 'server',        // Hybrid mode: SSR default; static pages opt-in via `export const prerender = true`
  adapter: vercel(),
  integrations: [
    react(),               // React islands (Toc)
    markdoc(),             // Keystatic Markdoc content
    keystatic(),           // Keystatic admin UI at /keystatic
    sitemap(),             // Auto sitemap.xml
    pagefind(),            // Static search index
  ],
})
