---
title: "Homepage Product Configurator — Multi-Select AI Input"
description: "AI Input → multi-select features (Landing/Blog/Chatbot/AI Content) → sections below morph dynamically. Quality comparison tables per selection."
status: complete
priority: P1
effort: 10h
branch: main
tags: [homepage, ai-search, dynamic-content, multi-select, ux]
created: 2026-03-31
updated: 2026-03-31
---

# Homepage Product Configurator — Multi-Select

## Problem

Homepage AI search shows static suggestions. User types → sees cards → nothing changes below. No way to explore different product combinations.

## Goal

User types → Enter → sees feature cards → **multi-select** 1 or more → ALL sections below morph. Each feature has its own content. Selecting multiple = auto-merged content.

## Features Available (v1)

| Feature | Emoji | What user gets |
|---------|-------|----------------|
| **Landing Page** | 🏗️ | Product page (hero, features, pricing, CTA) |
| **Blog** | ✍️ | Content engine (articles, SEO, RSS, AI writing) |
| **AI Content** | 🤖 | AI voice writing, auto-draft, content pipeline |
| **AI Chatbot** | 💬 | Customer support bot trained on your data |

## UX Flow

```
1. User lands → Hero + AI Input visible. Sections below hidden.

2. User types "I need a website for my SaaS product" → Enter
   → Thinking (1.2s)
   → Shows 4 feature cards with checkboxes:
     [🏗️ Landing Page] [✍️ Blog] [🤖 AI Content] [💬 AI Chatbot]

3. User clicks Landing Page → card gets ✓ selected state
   → Sections below APPEAR with landing-specific content
   → Demo: iframe /ck2
   → Features: 25 sections, AI gen, SEO
   → Comparison: tree-id vs Bolt vs Carrd (landing-focused)
   → Pricing: landing plans
   → CTA: "Build your landing page"

4. User ALSO clicks Blog → now 2 selected
   → Sections MORPH:
   → Demo: 2 tabs (landing + blog)
   → Features: merged unique features from both
   → Comparison: tree-id vs WordPress vs Ghost + Bolt vs Carrd
   → Pricing: bundle price
   → CTA: "Get Landing + Blog"

5. User deselects Blog → back to landing-only content
```

## Multi-Select Merge Logic

```
selectedFeatures = ['landing', 'blog']

mergedContent = {
  demo: union of all demo tabs,
  features: deduplicated features from all selected,
  comparison: merged comparison tables (each feature adds its competitors),
  pricing: bundle price calculation,
  faq: union of unique questions,
  cta: dynamic headline based on selection count + types
}
```

## Comparison Tables — Quality Standard

Each feature has its OWN comparison against relevant competitors:

### Landing Page comparison
| Criteria | tree-id | Bolt/Lovable | Carrd | Framer |
|----------|---------|-------------|-------|--------|
| You describe → you get | Live landing page | Code repo | Blank canvas | Template |
| Time to first visitor | <5 min | 30min+ (deploy) | 1-3h | 1-2h |
| SEO | Auto JSON-LD + meta | SPA, bad SEO | Basic meta | Good |
| Edit after | Visual editor | Code | Drag-drop | Drag-drop |
| AI copy | Built-in | Built-in | None | AI assist |
| Price | Free/$19 | $20/mo | $19/yr | $15/mo |

### Blog comparison
| Criteria | tree-id | WordPress | Ghost | Medium |
|----------|---------|-----------|-------|--------|
| Setup time | 5 min | 30min+ | 15min | Instant |
| Own your content | Git-tracked files | DB (exportable) | DB | Platform-locked |
| AI writing | Built-in voice AI | Plugins | None | None |
| SEO | Auto-optimized | Plugin-heavy | Good | Platform SEO |
| Monthly cost | Free/$19 | $5-30+/mo hosting | $9/mo | Free (limited) |
| Custom domain | Coming soon | Yes | Yes | Paid |

### Multi-select → merge tables side by side or stack vertically

## Phases

| # | Phase | Effort | Status | Description |
|---|-------|--------|--------|-------------|
| 1 | [Feature Data Schema](./phase-01-feature-data-schema.md) | 2h | complete | Per-feature content objects + merge logic types |
| 2 | [AI Search Multi-Select](./phase-02-ai-search-multi-select.md) | 2h | complete | Checkbox cards, toggle, event with selected[] |
| 3 | [Product Showcase Component](./phase-03-product-showcase.md) | 3h | complete | Dynamic section renderer with merge logic |
| 4 | [Quality Comparisons](./phase-04-quality-comparisons.md) | 2h | complete | Accurate comparison tables per feature |
| 5 | [Polish & Testing](./phase-05-polish-testing.md) | 1h | complete | Transitions, mobile, edge cases |

## Architecture

- **Each feature** = self-contained data object in YAML (demo, features, comparison, faq, cta)
- **Merge function** (client JS) = takes selectedFeatures[] → outputs merged content
- **1 new component** = `landing-product-showcase.astro` handles rendering + swap
- **AI search upgrade** = multi-select checkboxes instead of single click
- **No React** — pure inline JS + DOM manipulation + CSS transitions

## Dependencies
- Existing: `landing-ai-search.astro`, `home.yaml`, `landing-section-renderer.astro`
- No new packages

## Risk
- Content volume: 4 features × ~6 sections = ~24 content blocks. AI drafts, human reviews.
- Merge edge cases: 4 features selected = very long page. Cap at sensible merge (gộp features, stack comparisons).
