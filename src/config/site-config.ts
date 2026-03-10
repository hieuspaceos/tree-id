export const siteConfig = {
  name: 'Tree Identity',
  description: 'Digital Twin content engine',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  author: {
    name: '',
    email: '',
    url: '',
  },
  socialLinks: {
    twitter: '',
    github: '',
    linkedin: '',
  },
  theme: {
    /** Theme id — matches a key in src/themes/theme-resolver.ts */
    id: 'liquid-glass' as string,
  },
  features: {
    videoFactory: false,
    search: true,
  },
  r2: {
    publicUrl: process.env.R2_PUBLIC_URL || '',
  },
} as const

export type SiteConfig = typeof siteConfig
