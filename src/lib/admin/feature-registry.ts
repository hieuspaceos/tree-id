/**
 * Feature registry — central registry for optional admin features.
 * Each feature declares routes, nav items, and metadata.
 * Admin layout + sidebar consume this to dynamically render features.
 * Features default to enabled when enabledFeatures key is missing (backward compat).
 */
import type { ComponentType } from 'react'

export interface FeatureNavItem {
  href: string
  label: string
  iconKey: string
}

export interface FeatureRoute {
  path: string
  /** Lazy import returning a React component */
  component: () => Promise<{ default: ComponentType<any> }>
}

export interface FeatureModule {
  id: string
  label: string
  description: string
  section: 'content' | 'assets' | 'marketing' | 'system'
  iconKey: string
  /** Env var names to check — shown in settings integration panel */
  envCheck?: string[]
  routes: FeatureRoute[]
  navItems: FeatureNavItem[]
}

export type EnabledFeaturesMap = Record<string, boolean>

/** All optional features registered in the system */
export const FEATURE_MODULES: FeatureModule[] = [
  {
    id: 'voices',
    label: 'Writing Voices',
    description: 'AI writing voice profiles for content creation',
    section: 'content',
    iconKey: 'userPen',
    envCheck: ['GEMINI_API_KEY'],
    routes: [], // collection-based — handled inline in admin-layout
    navItems: [{ href: '/voices', label: 'Voices', iconKey: 'userPen' }],
  },
  {
    id: 'translations',
    label: 'Translations',
    description: 'i18n translation management',
    section: 'content',
    iconKey: 'globe',
    routes: [
      {
        path: '/translations',
        component: () =>
          import('@/components/admin/admin-translations-page').then((m) => ({
            default: m.AdminTranslationsPage,
          })),
      },
    ],
    navItems: [{ href: '/translations', label: 'Translations', iconKey: 'globe' }],
  },
  {
    id: 'media',
    label: 'Media Library',
    description: 'Image and file uploads via Cloudflare R2',
    section: 'assets',
    iconKey: 'image',
    envCheck: ['R2_ACCESS_KEY_ID'],
    routes: [
      {
        path: '/media',
        component: () =>
          import('@/components/admin/media-browser').then((m) => ({
            default: m.MediaBrowser,
          })),
      },
    ],
    navItems: [{ href: '/media', label: 'Media', iconKey: 'image' }],
  },
  {
    id: 'distribution',
    label: 'Distribution',
    description: 'Social media content distribution & scheduling',
    section: 'marketing',
    iconKey: 'megaphone',
    envCheck: ['GEMINI_API_KEY'],
    routes: [
      {
        path: '/marketing',
        component: () =>
          import('@/components/admin/marketing-dashboard').then((m) => ({
            default: m.MarketingDashboard,
          })),
      },
    ],
    navItems: [{ href: '/marketing', label: 'Distribution', iconKey: 'megaphone' }],
  },
  {
    id: 'email',
    label: 'Email & Subscribers',
    description: 'Newsletter subscriber management & broadcast',
    section: 'marketing',
    iconKey: 'mail',
    envCheck: ['RESEND_API_KEY'],
    routes: [
      {
        path: '/subscribers',
        component: () =>
          import('@/components/admin/admin-subscribers-page').then((m) => ({
            default: m.AdminSubscribersPage,
          })),
      },
    ],
    navItems: [{ href: '/subscribers', label: 'Subscribers', iconKey: 'mail' }],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'Google Analytics 4 dashboard',
    section: 'marketing',
    iconKey: 'chart',
    envCheck: ['GA_MEASUREMENT_ID'],
    routes: [
      {
        path: '/analytics',
        component: () =>
          import('@/components/admin/admin-analytics-page').then((m) => ({
            default: m.AdminAnalyticsPage,
          })),
      },
    ],
    navItems: [{ href: '/analytics', label: 'Analytics', iconKey: 'chart' }],
  },
  {
    id: 'goclaw',
    label: 'GoClaw API',
    description: 'External agent API adapter endpoints',
    section: 'system',
    iconKey: 'database',
    envCheck: ['GOCLAW_API_KEY'],
    routes: [],
    navItems: [],
  },
]

/** Check if feature enabled — defaults true when key missing (backward compat) */
export function isFeatureEnabled(
  featureId: string,
  enabledFeatures?: EnabledFeaturesMap
): boolean {
  if (!enabledFeatures) return true
  return enabledFeatures[featureId] !== false
}

export function getFeatureById(id: string): FeatureModule | undefined {
  return FEATURE_MODULES.find((f) => f.id === id)
}

export function getEnabledFeatures(enabledFeatures?: EnabledFeaturesMap): FeatureModule[] {
  return FEATURE_MODULES.filter((f) => isFeatureEnabled(f.id, enabledFeatures))
}

/** Group enabled features by section for sidebar rendering */
export function getFeaturesBySection(enabledFeatures?: EnabledFeaturesMap) {
  const enabled = getEnabledFeatures(enabledFeatures)
  return {
    content: enabled.filter((f) => f.section === 'content'),
    assets: enabled.filter((f) => f.section === 'assets'),
    marketing: enabled.filter((f) => f.section === 'marketing'),
    system: enabled.filter((f) => f.section === 'system'),
  }
}
