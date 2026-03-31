---
title: "Phase 2 — AI Search Multi-Select"
status: pending
priority: high
effort: 2h
---

# Phase 2: AI Search Multi-Select

## Overview
Upgrade ai-search component: suggestion cards become toggleable checkboxes. Multiple selections allowed. Each toggle dispatches event with current selected[] array.

## UX Behavior

1. After typing + Enter → show 4 feature cards in a row
2. Each card = toggle (click to select/deselect)
3. Selected card → accent border + ✓ checkmark + slight scale
4. Deselected card → default border, no checkmark
5. On each toggle → dispatch `CustomEvent('features-selected', { detail: { selected: FeatureProduct[] } })`
6. At least 1 selected → sections below appear
7. All deselected → sections below hide

## Card Layout

```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ ✓ 🏗️        │ │   ✍️        │ │   🤖        │ │   💬        │
│ Landing Page │ │   Blog      │ │ AI Content  │ │ AI Chatbot  │
│ Professional │ │ Content     │ │ AI writes   │ │ 24/7 support│
│ product page │ │ engine      │ │ for you     │ │ trained on  │
│ in 5 min     │ │             │ │             │ │ your data   │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
  [selected]      [default]       [default]       [default]
```

## Key Code Changes

```js
// Replace single-click handler with toggle
const selectedIds = new Set()

item.addEventListener('click', () => {
  const id = item.dataset.featureId
  if (selectedIds.has(id)) {
    selectedIds.delete(id)
    item.classList.remove('selected')
  } else {
    selectedIds.add(id)
    item.classList.add('selected')
  }

  const selected = featureProducts.filter(f => selectedIds.has(f.id))
  document.dispatchEvent(new CustomEvent('features-selected', {
    detail: { selected }
  }))
})
```

## Files to Modify
- `src/components/landing/landing-ai-search.astro` — multi-select logic, card redesign
- `src/lib/landing/landing-types.ts` — AiSearchData gets featureProducts[]

## Todo
- [ ] Add featureProducts to component props
- [ ] Render feature cards (4 columns, responsive to 2 on mobile)
- [ ] Toggle select/deselect with visual state
- [ ] Dispatch features-selected event with selected array
- [ ] CSS: selected state (accent border, checkmark, scale)
- [ ] Hide/show hint chips based on state
