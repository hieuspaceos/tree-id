# Project Changelog

All notable changes to Tree Identity are documented here.

## Releases

### v2.1.0 — MVP Feature Bundle + Consolidation (2026-03-12 → 2026-03-19)

**Status:** Complete

Extended the admin dashboard with major features and stabilized the codebase.

#### MVP Feature Bundle (2026-03-12)
- Multi-user auth: `ADMIN_USERS` env var (JSON array), username+password, roles (admin/editor)
- About page: `/about` with hero, bio, skills, projects grid from Records collection
- 404 page polish: glass-themed, tree metaphor, Pagefind search integration
- Email capture: Resend API + git-tracked YAML subscribers, subscribe/unsubscribe/broadcast APIs
- GA4 analytics: gtag.js conditional on `GA_MEASUREMENT_ID`, admin analytics page
- Integration status panel in admin settings
- New env vars: `ADMIN_USERS`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `GA_MEASUREMENT_ID`

#### CodeMirror 6 Editor (2026-03-12)
- Replaced textarea with Obsidian-like CM6 editor (11 modules in `codemirror/`)
- Live Preview, smart lists, auto-pairs, heading fold, image preview widget
- Callout blocks, typewriter mode, vim mode (lazy-loaded), drag-drop upload
- Glass morphism theme matching admin CSS vars

#### SEO Score Panel (2026-03-12)
- RankMath-style real-time SEO analysis with 18 checks
- Score badge in content list, detail panel in editor sidebar

#### Testing & Consolidation (2026-03-19)
- Vitest setup with 88 tests across 6 test files
- Tests cover: auth (JWT, password hashing, multi-user), content I/O (CRUD round-trips), SEO analyzer, subscriber I/O, validation, schema registry
- Modularized `content-io.ts` (379 LOC → 4 files, each <200 LOC)
- Updated README, changelog, roadmap, version alignment (v2.0.0)

---

### v2.0.0 — Custom Admin Dashboard (2026-03-11)

**Status:** Complete

Major feature release: replaced Keystatic's default UI with a premium custom admin dashboard built entirely from scratch using React + Astro + Tailwind CSS.

#### Phase 1-5: Foundation & Content Editor (Complete)
- Custom admin shell with sidebar navigation, topbar, and glass-panel styling
- Admin API layer for CRUD operations (read/write content files, auth)
- Content management UI: listing, filtering, pagination for articles/notes/records
- Rich Markdown editor (enhanced textarea with formatting toolbar):
  - Keyboard shortcuts (Ctrl+B/I/U, Ctrl+E for lists, etc.)
  - Code blocks with syntax highlighting
  - Block quotes, horizontal rules, heading levels
  - Marks: bold, italic, strikethrough, code inline
  - Full Markdoc serialization

#### Phase 6: Media Management (Complete)
- Drag-and-drop file upload with progress indicator
- Cloudflare R2 integration for media storage
- Media browser grid with thumbnails and lazy loading
- Media search by filename
- Integration with content editor:
  - Browse media button on cover/OG image fields
  - Image insertion in Markdown editor from media library
  - Copy media URL to clipboard
- Delete media files from grid
- Graceful degradation when R2 not configured

#### Phase 7: Preview & Polish (Complete)
- Live preview in content editor (opens seed detail page in new tab)
- Loading skeleton components for async operations
- Error boundary for crash recovery with user-friendly messaging
- Keyboard shortcuts cheat sheet (? key opens modal)
  - ? → open shortcuts
  - Ctrl+S → save entry
  - Escape → close dialogs
- Admin configuration in `site-config.ts` (title, brand color)
- Admin CSS styling complete (glass panels, media grid, upload zone, dialogs, skeletons)

#### Architecture & Files Created
**API Routes:**
- `src/pages/api/admin/media.ts` — GET list, DELETE files
- `src/pages/api/admin/upload.ts` — POST file uploads to R2

**React Components:**
- `src/components/admin/media-browser.tsx` — page + dialog modes
- `src/components/admin/media-upload-zone.tsx` — drag-drop area
- `src/components/admin/media-grid.tsx` — thumbnail grid
- `src/components/admin/admin-error-boundary.tsx` — crash recovery
- `src/components/admin/keyboard-shortcuts.tsx` — shortcuts modal
- `src/components/admin/loading-skeleton.tsx` — skeleton components

**Utilities:**
- `src/lib/admin/api-client.ts` — MediaItem type + media list/remove methods
- `src/lib/admin/schema-registry.ts` — mediaBrowse flag for cover/seo fields

**Files Modified:**
- `src/components/admin/field-renderers/text-field.tsx` — Browse Media button
- `src/components/admin/field-renderers/markdoc-editor.tsx` — image insertion
- `src/components/admin/field-renderers/render-field.tsx` — mediaBrowse prop passing
- `src/components/admin/admin-sidebar.tsx` — Media nav item + image icon
- `src/components/admin/admin-layout.tsx` — /media route
- `src/components/admin/admin-app.tsx` — ErrorBoundary, keyboard shortcuts
- `src/components/admin/content-editor.tsx` — Preview button
- `src/config/site-config.ts` — admin config section
- `src/styles/admin.css` — styles for all new components

**Build Status:**
- `astro check` → 0 errors
- `astro build` → succeeds
- Deployed to Vercel with custom admin at `/admin`

#### Breaking Changes
- Admin is now at `/admin` (was `/keystatic`)
- Keystatic no longer user-facing; only used internally for data schema/migration
- `/keystatic` redirected to `/admin` via `vercel.json`

---

### v1.2.0 — Content Distribution Workflow (2026-03-11)

**Status:** Complete

Implemented end-to-end social media post generation and distribution logging.

#### Features
- `scripts/distribute-content.py` — Generates social posts via Gemini Flash
  - Reads article markdown from `src/content/articles/{slug}/index.mdoc`
  - Prompts Gemini with content-distribution rules
  - Outputs posts for: Twitter, LinkedIn, Dev.to, Hashnode, Reddit, Facebook, Medium, Hacker News, Threads, Viblo
  - Logs to CSV: platform, post content, timestamp, status
- `docs/marketing-metrics.md` — bi-weekly tracking template for distribution campaigns
- `/distribute <slug>` skill for quick post generation
- `/marketing-review` skill for campaign analytics review
- Requires `GEMINI_API_KEY` env var (free tier sufficient)

---

### v1.1.0 — GEO Optimization (2026-03-10)

**Status:** Complete

Enhanced AI/LLM discoverability through structured data and crawler-friendly standards.

#### Phase 1-5: Enhanced SEO
- JSON-LD: Article + BreadcrumbList + Person schema with rich metadata
- llms.txt: Site overview for AI model training (speculative signal)
- AI meta tags: Dublin Core + citation_* attributes for semantic understanding
- RSS feed: `@astrojs/rss` for Bing/ChatGPT feed freshness signals
- robots.txt per-agent: blocking training crawlers (GPTBot, ClaudeBot, Meta-ExternalAgent), allowing search crawlers (OAI-SearchBot, Claude-SearchBot, PerplexityBot, Gemini-Deep-Research)
- mainEntityOfPage + citation_url linking patterns
- Summary field added to articles for cleaner AI extraction

#### Security
- `safeJsonLd()` function escapes `</script>` XSS vectors
- Single canonical link in base-layout prevents duplication issues

---

### v1.0.0 — Astro + Keystatic Migration (2026-03-10)

**Status:** Complete

Complete rebuild from Next.js 15 + Payload CMS + PostgreSQL to Astro 5 + Keystatic + git-based content.

#### Major Changes
- **Framework:** Next.js → Astro 5 (static site generation)
- **CMS:** Payload → Keystatic (git-based, GitHub storage mode)
- **Database:** PostgreSQL → git (no database needed)
- **Content:** All articles/notes/records migrated to Markdown/YAML
- **Search:** Pagefind static indexing
- **Deploy:** Vercel (same hosting, vastly simpler infra)
- **Theme:** Liquid glass morphism with CSS variable tokens

#### Architecture
- Zero-database design: all content in git
- Static-first: 99%+ pages are pre-rendered at build time
- Minimal JS: only React for ToC scroll spy and search UI
- File-based CMS: Keystatic reads/writes Markdown directly to git
- Type-safe: Astro content collections with Zod validation

#### Build & Deploy
- `astro check` → 0 errors
- `astro build` → succeeds
- Vercel Analytics + Speed Insights configured
- `/hs-admin` → `/keystatic` redirect via `vercel.json`

---

## Legend

- **Status:** Proposed | In Progress | Complete | Archived
- **Phases:** Breaking down large features into sequential, dependency-ordered tasks
- **Breaking Changes:** Highlighted for migration guide updates

---

**Last updated:** 2026-03-19
