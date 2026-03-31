---
title: "Phase 3 — Product Showcase Component with Merge Logic"
status: pending
priority: high
effort: 3h
---

# Phase 3: Product Showcase Component

## Overview
New `landing-product-showcase.astro` section type. Receives featureProducts data, listens for `features-selected` event, merges selected features' content, renders into placeholder containers with fade transitions.

## Merge Logic (client JS)

```js
function mergeFeatures(selected) {
  if (selected.length === 0) return null

  return {
    // Demo: union all tabs
    demoTabs: selected.flatMap(f => f.demo.tabs),

    // Features: deduplicate by title
    features: deduplicateByTitle(selected.flatMap(f => f.features)),

    // Comparison: stack tables (each feature's competitors separately)
    comparisons: selected.map(f => ({
      featureLabel: f.label,
      competitors: f.comparison.competitors,
      rows: f.comparison.rows
    })),

    // FAQ: union, deduplicate by question text
    faq: deduplicateByQ(selected.flatMap(f => f.faq)),

    // CTA: dynamic based on count
    cta: selected.length === 1
      ? selected[0].cta
      : {
          headline: `Get ${selected.map(f => f.label.replace(/^.*\s/, '')).join(' + ')}`,
          button: `Start with ${selected.length} features`,
          url: '/auth/login'
        }
  }
}
```

## HTML Structure

```html
<div id="product-showcase" style="display:none">
  <!-- Demo iframe with tabs -->
  <div id="ps-demo"></div>

  <!-- Features grid -->
  <div id="ps-features"></div>

  <!-- Comparison tables (stacked per feature) -->
  <div id="ps-comparison"></div>

  <!-- FAQ accordion -->
  <div id="ps-faq"></div>

  <!-- CTA banner -->
  <div id="ps-cta"></div>
</div>
```

## Render Functions (client JS)

Each section has a `renderXxx(data)` function returning HTML string:
- `renderDemo(tabs)` — browser mockup + iframe + tab switcher
- `renderFeatures(items)` — bento grid cards
- `renderComparisons(tables)` — stacked comparison tables with section headers
- `renderFaq(items)` — accordion
- `renderCta(cta)` — banner with button

## Transition
- On event: fade out (opacity 0, 200ms) → swap innerHTML → fade in (opacity 1, 200ms)
- First selection: slide down from hidden

## Files to Create
- `src/components/landing/landing-product-showcase.astro` (~180 lines)

## Files to Modify
- `src/components/landing/landing-section-renderer.astro` — register `product-showcase` type
- `src/lib/landing/landing-types.ts` — add ProductShowcaseData interface
- `src/content/landing-pages/home.yaml` — replace static sections with 1 product-showcase section

## Todo
- [ ] Create ProductShowcaseData type
- [ ] Build component with placeholder containers
- [ ] Implement merge logic in inline JS
- [ ] Implement render functions for each section
- [ ] Register in section-renderer componentMap
- [ ] Update home.yaml: remove old static sections, add product-showcase
- [ ] Test single select + multi select + deselect
