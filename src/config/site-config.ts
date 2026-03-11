/**
 * Site Identity Configuration
 *
 * This is THE file to customize your TreeID instance.
 * Edit these values, deploy, and you're live.
 *
 * Quick start:
 *   1. Fill in name, description, author, socialLinks
 *   2. Set PUBLIC_SITE_URL in .env.local (and in Vercel dashboard)
 *   3. Run `npm run dev` to preview
 */
export const siteConfig = {
  /** Your site/brand name (shown in nav, footer, OG images) */
  name: 'Tree Identity',

  /** One-line description (shown in hero, meta tags, JSON-LD) */
  description: 'Digital Twin content engine',

  /** Your deployed URL (used for sitemap, OG images, JSON-LD)
   *  Set PUBLIC_SITE_URL env var in Vercel — do not hardcode here */
  url: import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321',

  /** Author info (used in JSON-LD, meta tags) */
  author: {
    name: '',    // e.g. 'Jane Doe'
    email: '',   // e.g. 'jane@example.com'
    url: '',     // e.g. 'https://janedoe.com'
  },

  /** Social links (shown in nav bar — leave empty string to hide) */
  socialLinks: {
    twitter: '',   // e.g. 'https://twitter.com/janedoe'
    github: '',    // e.g. 'https://github.com/janedoe'
    linkedin: '',  // e.g. 'https://linkedin.com/in/janedoe'
  },

  /** Active theme — must match a key registered in src/themes/theme-resolver.ts
   *  Built-in options: 'liquid-glass'
   *  To add a theme: create src/themes/my-theme.ts, register in theme-resolver.ts */
  theme: {
    id: 'liquid-glass' as string,
  },

  /** Feature toggles — disable features you don't need */
  features: {
    /** R2-based video manifests (requires R2_* env vars) */
    videoFactory: false,
    /** Pagefind full-text search page at /search */
    search: true,
  },

  /** Admin dashboard config — customizes the admin SPA at /admin */
  admin: {
    /** Title shown in sidebar header */
    title: 'Admin',
    /** Accent color override for admin UI (optional) */
    brandColor: '',
  },

  /** Cloudflare R2 — optional, only needed for video manifests / media storage
   *  Set R2_* env vars in .env.local and Vercel dashboard */
  r2: {
    publicUrl: import.meta.env.R2_PUBLIC_URL || '',
  },
} as const

export type SiteConfig = typeof siteConfig
