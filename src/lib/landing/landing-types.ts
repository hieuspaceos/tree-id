/**
 * Landing page type definitions — shared by Astro components, admin editor, and GoClaw API.
 * Each section type has a typed data interface matching the YAML config schema.
 */

export interface HeroData {
  headline: string
  subheadline?: string
  cta?: { text: string; url: string }
  backgroundImage?: string
  embed?: string
}

export interface FeatureItem {
  icon?: string
  title: string
  description: string
}
export interface FeaturesData {
  heading?: string
  subheading?: string
  items: FeatureItem[]
  columns?: 2 | 3 | 4
}

export interface PricingPlan {
  name: string
  price: string
  period?: string
  description?: string
  features: string[]
  cta: { text: string; url: string }
  highlighted?: boolean
}
export interface PricingData {
  heading?: string
  subheading?: string
  plans: PricingPlan[]
}

export interface Testimonial {
  quote: string
  name: string
  role?: string
  company?: string
  avatar?: string
}
export interface TestimonialsData {
  heading?: string
  items: Testimonial[]
}

export interface FaqItem {
  question: string
  answer: string
}
export interface FaqData {
  heading?: string
  items: FaqItem[]
}

export interface CtaData {
  headline: string
  subheadline?: string
  cta: { text: string; url: string }
  variant?: 'default' | 'accent' | 'dark'
}

export interface StatItem {
  value: string
  label: string
  prefix?: string
  suffix?: string
}
export interface StatsData {
  heading?: string
  items: StatItem[]
}

export interface StepItem {
  number?: number
  title: string
  description: string
  icon?: string
}
export interface HowItWorksData {
  heading?: string
  subheading?: string
  items: StepItem[]
}

export interface TeamMember {
  name: string
  role: string
  photo?: string
  bio?: string
  social?: { twitter?: string; linkedin?: string; github?: string }
}
export interface TeamData {
  heading?: string
  subheading?: string
  members: TeamMember[]
}

export interface LogoWallData {
  heading?: string
  logos: Array<{ name: string; url?: string; image: string }>
}

export interface NavData {
  brandName?: string
  /** Custom nav links — if empty, auto-generated from enabled sections */
  links?: Array<{ label: string; href: string }>
}

export interface FooterData {
  text?: string
  links?: Array<{ label: string; href: string }>
}

/** All possible section type identifiers */
export type SectionType = 'hero' | 'features' | 'pricing' | 'testimonials' | 'faq' | 'cta' | 'stats' | 'how-it-works' | 'team' | 'logo-wall' | 'nav' | 'footer'

/** Union of all section data types */
export type SectionData = HeroData | FeaturesData | PricingData | TestimonialsData | FaqData | CtaData | StatsData | HowItWorksData | TeamData | LogoWallData | NavData | FooterData

export interface LandingSection {
  type: SectionType
  order: number
  enabled: boolean
  data: SectionData
}

export interface LandingPageConfig {
  slug: string
  title: string
  description?: string
  template?: string
  sections: LandingSection[]
}
