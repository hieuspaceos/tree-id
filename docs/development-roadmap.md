# Development Roadmap

Strategic roadmap for Tree Identity. Tracks active work, completed milestones, and future directions.

## Current Status (2026-03-25)

**Phase:** v2.1.0 complete + GoClaw Phase 1 (API adapter for external agents)
**Completion:** Phases 1-4.5 complete. GoClaw API Phase 1 complete. Ready for external AI integration.
**Active Team:** Solo (HieuSpace)
**Key Features Added:** Voice profiles + effectiveness scoring, i18n module, CSS modularization, AI voice analysis/preview, GoClaw API adapter

---

## Phase 1 — Foundation & Migration ✓ COMPLETE

**Timeline:** 2026-03-01 to 2026-03-10
**Status:** Complete
**Effort:** 40 hours

### Deliverables
- [x] Astro 5 migration from Next.js 15 + Payload CMS
- [x] Content schema: Articles, Notes, Records (Markdown + YAML)
- [x] Keystatic integration (local dev + GitHub production mode)
- [x] Theme system: CSS variable tokens, liquid-glass theme
- [x] Pagefind static search indexing
- [x] Vercel deployment with Analytics + Speed Insights
- [x] CI/CD: GitHub Actions, branch protection, auto-deploy

**Key Decisions:**
- No database: git is source of truth
- Static-first: 99% pre-rendered pages
- Minimal JS: zero by default, islands only where needed

---

## Phase 2 — AI/LLM Optimization ✓ COMPLETE

**Timeline:** 2026-03-10 to 2026-03-11
**Status:** Complete
**Effort:** 8 hours

### Deliverables
- [x] JSON-LD schema: Article, BreadcrumbList, Person entities
- [x] llms.txt site overview (speculative AI signal)
- [x] Citation metadata: Dublin Core, citation_* attributes
- [x] RSS feed: `@astrojs/rss` for feed freshness
- [x] robots.txt per-AI-agent (training vs search crawlers)
- [x] XSS protection: `safeJsonLd()` escapes
- [x] Article summaries for cleaner AI extraction

**Success Metrics:**
- AI crawlers (Claude-SearchBot, PerplexityBot, Gemini-Deep-Research) can index content
- Training crawlers (GPTBot, ClaudeBot) are blocked
- JSON-LD validates against Schema.org

---

## Phase 3 — Custom Admin Dashboard ✓ COMPLETE

**Timeline:** 2026-03-10 to 2026-03-11
**Status:** Complete
**Effort:** 32 hours

### Deliverables
- [x] Admin shell: sidebar navigation, topbar, glass-panel styling
- [x] API layer: CRUD for articles/notes/records, auth middleware
- [x] Content editor: enhanced Markdown textarea with toolbar + Markdoc output
- [x] Media browser: drag-drop upload, R2 integration, thumbnails
- [x] Preview: live seed page preview with draft support
- [x] Polish: error boundaries, keyboard shortcuts, loading skeletons
- [x] Config: `site-config.ts` admin branding (title, color)
- [x] Build: 0 Astro check errors, `astro build` succeeds

**Architecture:**
- Admin SPA at `/admin` (Astro SSR shell + React islands)
- Auth: env-var password + 7-day session cookies
- Media: Cloudflare R2 with `ListObjectsV2` pagination
- Editor: Enhanced Markdown textarea with formatting toolbar

**Breaking Changes:**
- Keystatic UI no longer user-facing (internal schema only)
- Admin moved from `/keystatic` to `/admin`

---

## Phase 4 — Content Distribution Pipeline ✓ COMPLETE

**Timeline:** 2026-03-11
**Status:** Complete
**Effort:** 4 hours

### Deliverables
- [x] `scripts/distribute-content.py`: Gemini Flash social post generation
- [x] Content distribution rules: 10 platform formats (Twitter, LinkedIn, Dev.to, Hashnode, Reddit, Facebook, Medium, Hacker News, Threads, Viblo)
- [x] Distribution logging: CSV with timestamp, platform, post content, status
- [x] `/distribute <slug>` skill for quick generation
- [x] `/marketing-review` skill for campaign tracking
- [x] `docs/marketing-metrics.md` bi-weekly template

**Success Metrics:**
- Can generate 10 platform variants from 1 article in <5 seconds
- Posts follow brand voice: thoughtful, concise, no hype
- CSV logging enables ROI tracking

---

## Phase 4.5 — Voice Management System ✓ COMPLETE

**Timeline:** 2026-03-19
**Status:** Complete
**Effort:** 8 hours

### Deliverables
- [x] Voice profiles collection: create/edit/delete in admin UI (`/admin/voices`)
- [x] i18n module: translations editor with EN/VI support, dynamic key creation
- [x] Voice effectiveness scoring: 6-dimension heuristic evaluation with visual score badge
- [x] AI voice analysis: Gemini-powered evaluation with bilingual feedback (EN/VI)
- [x] Voice preview generator: AI-generated opening paragraphs in voice style (200+ words)
- [x] Chip-select defaults: wired to i18n translations system for voice options
- [x] ArrayField enhancement: fixed to handle nested objects (`{context, text}` samples)
- [x] Content list UX: hidden status/published for config collections (voices, categories)
- [x] CSS modularization: split admin.css (1247 LOC) → 7 focused modules (<200 LOC each)
- [x] Admin UI redesign: Fira Sans/Code fonts, 3-tier glass morphism, animations, mobile responsive
- [x] New API endpoints: `/api/admin/voice-analyze`, `/api/admin/voice-preview`
- [x] New components: `voice-score-panel.tsx`, `voice-preview-modal.tsx`

**Architecture:**
- Voice profiles: separate collection with language/tone/audience metadata
- i18n system: centralized translations for UI + voice option defaults
- Gemini integration: system prompts for voice analysis + preview generation
- CSS: modularized into semantic layers (tokens, layout, components, editor, table, media, responsive)

**Key Insights:**
- Voice samples collection as `array` of objects (not string items) works with enhanced ArrayField
- CSS modularization enables ~70% reuse for potential white-label themes
- i18n module extensible for future language support (currently EN/VI)

---

## Phase 5 — Consolidation (Backlog from 2026-03-19)

**Status:** Pending (Phase 4.5 voice management now complete)
**Previous Deliverables:** 88 tests, modularized content-io, docs sync

---

## Phase 6 — GoClaw API Adapter ✓ COMPLETE (Phase 1)

**Timeline:** 2026-03-25
**Status:** Phase 1 Complete (Health + Webhook)
**Effort:** 3 hours

### Phase 1 Deliverables
- [x] GoClaw API authentication: Bearer token verification via `GOCLAW_API_KEY` env var
- [x] Health check endpoint: `GET /api/goclaw/health` (returns 503 if not configured)
- [x] Webhook receiver: `POST /api/goclaw/webhook` with HMAC-SHA256 signature verification
- [x] Shared types: WebhookPayload, GoclawApiResponse interfaces
- [x] Write policy: All writes force `status: draft` (human approval required)
- [x] Documentation: System architecture + API reference

**Architecture:**
- External AI agents (GoClaw orchestration) authenticate via Bearer token
- All writes forbidden from publishing directly — must go through admin approval
- Webhook verification optional (graceful degradation if secret not set)
- Versioned API: `/api/goclaw/health` returns version string

**Key Insights:**
- GoClaw acts as content initiator, Tree Identity as decision layer
- Draft forcing is security-critical: prevents AI from publishing unreviewed content
- HMAC verification optional but recommended for production GoClaw instances

### Phase 2-4 (Backlog)
- Phase 2: Content CRUD endpoints (`/api/goclaw/content/{slug}`)
- Phase 3: Voice profiles reader (`/api/goclaw/voices`)
- Phase 4: SEO analysis trigger (`/api/goclaw/seo-analyze`)

---

## Phase 6 — Future Enhancements (Backlog)

### 6A — Analytics Dashboard (Proposed)
**Effort:** 12 hours
**Priority:** P2

- Integrate Vercel Analytics API
- Custom `/admin/analytics` dashboard
- Metrics: page views, traffic sources, referrers, device types
- UI: charts, filters by date range, export CSV
- Goal: understand audience engagement

**Dependencies:**
- Vercel API key in .env
- React Chart library (recharts or similar)

---

### 6B — Advanced Media Features (Proposed)
**Effort:** 8 hours
**Priority:** P3

- Image optimization: auto-resize, WebP conversion on upload
- Video playback integration: HLS support for adaptive streaming
- Image metadata: EXIF extraction, alt-text auto-population
- Batch operations: bulk upload, bulk delete, bulk tag
- Asset versioning: track media history, restore old versions

**Dependencies:**
- Sharp library for image processing
- R2 versioning API

---

### 6C — Collaborative Editing (Proposed)
**Effort:** 20 hours
**Priority:** P4

- Multi-user admin sessions (WebSocket sync)
- Real-time cursor positions + selections
- Conflict resolution: last-write-wins or operational transform
- Audit log: who changed what, when

**Dependencies:**
- Socket.io or similar real-time library
- Postgres for session state (contradicts no-DB philosophy — defer)

---

### 6D — Content Versioning & History (Proposed)
**Effort:** 6 hours
**Priority:** P2

- Git history viewer in admin dashboard
- Diff viewer: see changes between versions
- Revert functionality: restore old versions
- Branching support: draft vs published versions

**Dependencies:**
- `simple-git` or `nodegit` library
- Already have git history available

---

### 6E — Internationalization (i18n) Extended (Proposed)
**Effort:** 8 hours
**Priority:** P3

*Note: i18n module foundation completed in Phase 4.5*

- Multi-language content: `/en/*`, `/vi/*` URL structure
- Content collections per language
- Language selector in header
- Runtime language switching (not just UI)

**Dependencies:**
- Astro i18n integration
- Keystatic multi-locale support

---

### 6F — Plugin System (Proposed)
**Effort:** 16 hours
**Priority:** P5

- Custom field types: extend admin form builder
- Custom components in Markdoc: user-defined blocks
- Hooks: before-save, after-publish, on-delete
- Distribution templates: generate custom social formats

**Dependencies:**
- Plugin architecture design (how to load/validate plugins?)
- Package marketplace for community plugins

---

### 6G — Monetization Features (Proposed)
**Effort:** 12 hours
**Priority:** P4

- Paywalled content: premium articles with Stripe integration
- Newsletter subscription: email capture + delivery
- Sponsorship slots: paid ad integration in articles
- Affiliate links: tracking and ROI per link

**Dependencies:**
- Stripe API + webhook handling
- Email service (SendGrid, Resend, Brevo)
- Analytics for ROI tracking

---

### 6H — Search Enhancements (Proposed)
**Effort:** 6 hours
**Priority:** P3

- Faceted search: filter by tag, category, date
- Search analytics: popular queries, zero-result queries
- Typo correction: "did you mean?" suggestions
- Search ranking tuning: boost recent articles

**Dependencies:**
- Pagefind API deeper integration
- Analytics data collection

---

## Success Metrics (Current Phase)

| Metric | Target | Actual |
|--------|--------|--------|
| Page load (CLS) | < 0.1 | ✓ 0.04 |
| Lighthouse score | > 95 | ✓ 98 |
| Build time | < 30s | ✓ 12s |
| Admin bundle size | < 300KB | ✓ 220KB |
| Content creation cycle | < 10 min | ✓ 8 min |
| Search latency | < 100ms | ✓ 50ms |
| Vercel cold start | < 1s | ✓ 0.3s |

---

## Dependencies & Blockers

### Clear
- All phases 1-4 dependencies resolved
- Admin dashboard fully functional and shippable

### Potential Future Blockers
- **Vercel function size limits:** Current admin bundle ~220KB, room for growth
- **R2 API rate limits:** Media listing uses `ListObjectsV2`, okay for <100K files
- **Keystatic GitHub mode:** Works in production, tested with HSpaceOS org

---

## Resource Allocation

| Phase | Timeline | Effort | Owner | Status |
|-------|----------|--------|-------|--------|
| 1 — Foundation | 2026-03-01..03-10 | 40h | HieuSpace | ✓ Complete |
| 2 — AI Optimization | 2026-03-10..03-11 | 8h | HieuSpace | ✓ Complete |
| 3 — Admin Dashboard | 2026-03-10..03-11 | 32h | HieuSpace | ✓ Complete |
| 4 — Distribution | 2026-03-11 | 4h | HieuSpace | ✓ Complete |
| 5A — Analytics | TBD | 12h | — | Proposed |
| 5B — Media+ | TBD | 8h | — | Proposed |
| 5C — Collaboration | TBD | 20h | — | Proposed |

---

## Release Schedule

| Release | Version | Target Date | Focus | Status |
|---------|---------|-------------|-------|--------|
| Current | v2.1.0 | 2026-03-19 | Voice Profiles + i18n + Admin UI Redesign | Complete |
| Planned | v2.2.0 | 2026-Q2 | Analytics + Media Features | Backlog |
| Planned | v2.3.0 | 2026-Q2 | Versioning + Search Enhancements | Backlog |
| Planned | v3.0.0 | 2026-Q3 | Extended i18n + Plugin System | Backlog |

---

## Notes

- **No database** philosophy preserved: git is the single source of truth
- **Configuration-driven**: site identity fully controlled via `site-config.ts`
- **Sellability**: admin dashboard is modular, exportable as npm package for white-label use
- **AI-first**: all content is structured for AI crawling and understanding
- **Performance-obsessed**: every release targets <100ms full-page load, zero layout shift

---

**Last updated:** 2026-03-19
**Next review:** 2026-04-01
