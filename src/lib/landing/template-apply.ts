/**
 * Template application helper — copies template sections into a new landing page config.
 * Used by admin "Create from template" flow and AI setup wizard.
 */
import type { LandingPageConfig, LandingSection } from './landing-types'

export function applyTemplate(
  templateSections: LandingSection[],
  overrides: { title: string; description?: string; slug: string },
): LandingPageConfig {
  return {
    slug: overrides.slug,
    title: overrides.title,
    description: overrides.description,
    sections: templateSections.map(s => ({ ...s })),
  }
}
