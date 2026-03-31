---
title: "Phase 1 — Feature Data Schema"
status: pending
priority: high
effort: 2h
---

# Phase 1: Feature Data Schema

## Overview
Define per-feature content objects in YAML + TypeScript types. Each feature (landing, blog, ai-content, chatbot) has its own demo, features, comparison, faq, cta content.

## Data Structure

```yaml
# In home.yaml ai-search section
featureProducts:
  - id: landing
    label: "🏗️ Landing Page"
    tagline: "Professional product page in 5 minutes"
    demo:
      tabs:
        - label: ClaudeKit
          src: /ck2
        - label: Dark Edition
          src: /ck3
    features:
      - icon: "🎨"
        title: "25+ Section Types"
        desc: "Hero, features, pricing, FAQ, testimonials..."
      - ...
    comparison:
      competitors: ["Bolt/Lovable", "Carrd", "Framer"]
      rows:
        - label: "You describe → you get"
          values: ["Live landing page", "Code repo", "Blank canvas", "Template"]
        - ...
    faq:
      - q: "How is this different from Carrd?"
        a: "..."
    cta:
      headline: "Your product deserves customers."
      button: "Build your landing page"
      url: "#section-ai-search"
```

## Merge Logic Types

```ts
interface FeatureProduct {
  id: string
  label: string
  tagline: string
  demo: { tabs: Array<{ label: string; src: string }> }
  features: Array<{ icon: string; title: string; desc: string }>
  comparison: {
    competitors: string[]
    rows: Array<{ label: string; values: string[] }>
  }
  faq: Array<{ q: string; a: string }>
  cta: { headline: string; button: string; url: string }
}

// Merge function signature
function mergeProducts(selected: FeatureProduct[]): MergedContent
```

## Files to Modify
- `src/lib/landing/landing-types.ts` — add FeatureProduct, AiSearchData.featureProducts
- `src/content/landing-pages/home.yaml` — add featureProducts array with 4 features

## Todo
- [ ] Define FeatureProduct type in landing-types.ts
- [ ] Write landing feature content (migrate existing)
- [ ] Write blog feature content (new)
- [ ] Write ai-content feature content (new)
- [ ] Write chatbot feature content (new)
- [ ] Verify YAML parses + build passes
