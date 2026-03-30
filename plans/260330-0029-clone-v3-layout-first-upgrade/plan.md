---
title: "Clone v3 — Layout-First, Production-Quality Upgrade"
description: "Upgrade AI clone pipeline from flat section lists to layout-first approach with real-world layouts, responsive mobile, and design presets"
status: complete
priority: P1
effort: 72h
branch: main
tags: [ai-clone, landing-page, layout, responsive, design-system]
created: 2026-03-30
---

# Clone v3 — Layout-First, Production-Quality Upgrade

## Current State (v2)

- 26 section types, each with 2-4 variants
- Clone pipeline: Tier 1 (direct) + Tier 2 (structure-first 2-step)
- Layout section exists but only supports simple column grids (`[1,1]`, `[2,1]`)
- No responsive layout breakpoints, no hamburger nav
- Design system: CSS vars (`--lp-*`), scoped CSS per section, smart style defaults
- Scoped CSS + section style overrides for visual fidelity
- Key files:
  - `src/lib/admin/landing-clone-ai.ts` — main clone pipeline (~550 lines)
  - `src/lib/admin/clone-ai-utils.ts` — utilities (Gemini API, parsing, normalization)
  - `src/components/landing/*.astro` — 27 section components
  - `src/lib/landing/landing-types.ts` — TypeScript types for all sections
  - `src/styles/landing.css` — design system CSS
  - `src/content.config.ts` — Zod schemas for YAML content

## Target State (v3)

Clone any URL -> production-quality landing page in 1 click:
- Layout skeleton matches original (not just content extraction)
- Works on mobile/tablet/desktop
- Switchable design presets (SaaS dark, Travel warm, etc.)
- Quality: 9/10 (up from ~6/10)

## Architecture Decisions

1. **Backward compatible** — v3 YAML format extends v2, existing pages keep working
2. **Layout variants via CSS** — no runtime JS, just variant class on `<section>` wrapper
3. **Presets = CSS var overrides** — preset selection writes `design.preset` to YAML, page root applies vars
4. **Mobile-first CSS** — base styles = mobile, media queries add desktop layout
5. **Layout-first pipeline** — new Gemini step extracts page skeleton BEFORE content

---

## Phase 1: Layout System Upgrade (16h)
> [Detailed plan](./phase-01-layout-system-upgrade.md)

Add layout variants + responsive breakpoints to `landing-layout.astro`.

**Status:** ✅ complete (commit `1e9e886`)

## Phase 2: Section Variant Expansion (18h)
> [Detailed plan](./phase-02-section-variant-expansion.md)

Add 2-3 new variants per major section type; ensure all work on dark/light + responsive.

**Status:** ✅ complete (commit `1e9e886` — 48 variants, 15 new components)

## Phase 3: Clone Pipeline v3 — Layout-First (16h)
> [Detailed plan](./phase-03-clone-pipeline-v3.md)

New Gemini call for layout skeleton extraction; map content into skeleton; variant auto-selection.

**Status:** ✅ complete — modularized 1183→364 lines, v3 layout-first pipeline, v2/v3/auto selection

## Phase 4: Design Presets & Theme System (10h)
> [Detailed plan](./phase-04-design-presets.md)

8 built-in presets; admin preset switcher; CSS var override system; clone preset matching.

**Status:** ✅ complete — 8 presets, resolveDesign, designToCssVars, Google Fonts, admin panel, RGB color matching

## Phase 5: Mobile & Polish (12h)
> [Detailed plan](./phase-05-mobile-polish.md)

Hamburger nav, responsive audit, dark theme fixes, image optimization, a11y.

**Status:** ✅ complete — hamburger all nav variants, .lp-dark-section, skip-to-content, focus indicators, image lazy/async

---

## Dependencies

```
Phase 1 (Layout) ──┐
Phase 2 (Variants) ─┼──> Phase 3 (Pipeline v3) ──> Phase 5 (Polish)
                    │
                    └──> Phase 4 (Presets) ────────> Phase 5 (Polish)
```

Phases 1 + 2 can run in parallel. Phase 3 depends on 1+2. Phase 4 can start after Phase 1. Phase 5 is final integration.

## Success Criteria

- [x] Clone claudekit.cc -> layout matches (sidebar, grid, multi-col)
- [x] Clone aucoeurvietnam.com -> travel layout matches (hero, gallery grid, pricing cards)
- [x] Mobile: hamburger nav works, all sections readable at 375px
- [x] Preset switch changes entire page look in admin
- [x] Existing v2 YAML pages render unchanged
- [x] Gemini API cost: max 2 additional calls per clone (layout + variant selection)
