# Tree Identity — Codebase Summary

**Status:** v2.1.0 — Voice Profiles + i18n + Admin UI Redesign
**Last Updated:** 2026-03-19
**Stack:** Astro 5 + Keystatic + Pagefind + Cloudflare R2 (optional)
**Deployment:** Vercel

## Overview

Tree Identity is a personal content engine — zero database, git-tracked content, zero JS by default. Built with Astro 5 (SSG), Keystatic (git-based CMS), Pagefind (static search), and Vercel.

**Why Astro + Keystatic:**
- No database overhead (was: PostgreSQL + Supabase)
- Content tracked in git (Markdown + YAML)
- Admin UI at `/keystatic` (dev only, not production)
- Static search (Pagefind, zero runtime cost)
- Faster builds, zero JS by default
- Better for RAG/AI (Markdown > Lexical JSON)

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Astro 5 | SSG, content-first, zero JS by default |
| CMS | Keystatic | Git-based admin UI + content file storage |
| Content Format | Markdoc (articles) + YAML (notes/records) | Type-safe, semantic |
| Search | Pagefind | Static index, zero runtime cost |
| Storage | Cloudflare R2 | Optional, for video manifests + media |
| Styling | Tailwind CSS 4 | Utility-first, theme variables |
| Deploy | Vercel | Serverless, ISR-ready |

## Key Design Decisions

- **No database** — Content is git-tracked Markdown/YAML in `src/content/`
- **Git-based CMS** — Keystatic edits save as files, no DB writes
- **Static by default** — `output: 'static'`; SSR endpoints use `prerender: false`
- **Admin local-only** — Keystatic UI at `/keystatic` in dev, not deployed
- **Theme system** — CSS variables (`--t-*`) for glass morphism UI
- **Island architecture** — Astro by default, React only for ToC + search (client components)
- **No component library** — Plain Tailwind CSS 4, no shadcn/ui

## Directory Structure

```
tree-id/
├── src/
│   ├── content/                     # Keystatic-managed content (git-tracked)
│   │   ├── articles/               # Long-form Markdoc articles
│   │   │   └── my-article/
│   │   │       └── index.mdoc      # Markdoc + frontmatter
│   │   ├── notes/                  # Short-form YAML notes
│   │   │   └── my-note.yaml
│   │   ├── records/                # Structured YAML records
│   │   │   └── my-record.yaml
│   │   └── site-settings/
│   │       └── index.yaml          # Global settings (theme, etc.)
│   ├── pages/                       # Astro page routes
│   │   ├── index.astro             # Home page (lists all seeds)
│   │   ├── seeds/
│   │   │   └── [slug].astro        # Seed detail page (articles/notes)
│   │   ├── search.astro            # Pagefind search results
│   │   ├── 404.astro               # 404 page
│   │   ├── robots.txt.ts           # robots.txt generation
│   │   ├── rss.xml.ts              # RSS feed (Bing/ChatGPT freshness)
│   │   ├── llms.txt.ts             # AI/LLM site overview (llmstxt.org)
│   │   ├── llms-full.txt.ts        # Extended AI/LLM context
│   │   ├── og.ts                   # Dynamic OG image generation
│   │   └── api/
│   │       ├── manifests/[slug].ts # Video manifest HTTP API
│   │       └── goclaw/
│   │           ├── health.ts       # Health check endpoint
│   │           └── webhook.ts      # GoClaw webhook receiver
│   ├── layouts/
│   │   └── base-layout.astro       # Root layout with nav + footer
│   ├── components/                  # Astro + React components
│   │   ├── nav.astro               # Header navigation
│   │   ├── footer.astro            # Footer
│   │   ├── seed-card.astro         # Content card
│   │   ├── breadcrumb.astro        # Breadcrumb nav
│   │   ├── search-pagefind.astro   # Pagefind UI (client island)
│   │   └── islands/
│   │       └── toc.tsx             # Table of contents (React island)
│   ├── lib/
│   │   ├── content-helpers.ts      # getCollection() queries
│   │   ├── get-active-theme-id.ts  # Theme resolver
│   │   ├── r2/
│   │   │   └── upload-manifest.ts  # R2 upload/read
│   │   └── seo/
│   │       └── json-ld.ts          # JSON-LD schema
│   ├── themes/
│   │   ├── theme-types.ts          # TypeScript types
│   │   ├── theme-resolver.ts       # Theme registry
│   │   └── liquid-glass.ts         # Glass morphism theme (CSS tokens)
│   └── config/
│       └── site-config.ts          # Site identity (name, author, social, theme)
├── docs/
│   ├── project-overview.md         # Vision + architecture
│   ├── codebase-summary.md         # This file
│   ├── system-architecture.md      # Astro pipeline + data flow
│   ├── deployment-guide.md         # Dev setup + Vercel
│   ├── code-standards.md           # Conventions + patterns
│   ├── site-config-reference.md    # Config field reference
│   └── video-factory-contract.md   # Video manifest schema
├── .env.example                    # Environment variables
├── astro.config.mjs                # Astro config + integrations
├── keystatic.config.ts             # Keystatic collections + singleton
├── src/content.config.ts           # Astro content collections schema
├── tailwind.config.ts              # Tailwind + theme tokens
├── tsconfig.json
├── package.json
├── vercel.json                     # Vercel config
└── README.md                       # Quick start
```

## Content Collections

Defined in `keystatic.config.ts` + `src/content.config.ts`. All inherit base fields from `baseSeedFields`.

### Voices (New — 2026-03-19)

**Path:** `src/content/voices/{id}.yaml`
**Purpose:** Voice profiles for AI-powered writing style generation and content analysis

**Fields:**
| Field | Type | Purpose |
|-------|------|---------|
| `id` | slug | Unique voice identifier |
| `name` | text | Display name (e.g., "Tech Casual") |
| `tone` | select | casual, professional, technical, storytelling, persuasive, academic |
| `industry` | select | technology, business, travel, lifestyle, finance, health, education, food, general |
| `audience` | select | junior-dev, senior-dev, non-tech, students, business, general |
| `pronoun` | text | First-person word ("I", "we", "tôi") |
| `language` | select | vi, en |
| `samples[]` | array | `[{context: string, text: string}]` — example paragraphs to mimic |
| `avoid[]` | array | Phrases never to use in this voice |
| `status` | select | draft, published |

**Admin UI:** `/admin/voices` — Create/read/update/delete with live effectiveness scoring

### Shared Fields (All Seed Types)

| Field | Type | Path | Default |
|-------|------|------|---------|
| `title` | slug | — | Required |
| `description` | text (multiline) | — | Required |
| `summary` | text (multiline, max 300) | — | Optional (AI-optimized summary, falls back to description) |
| `status` | select | — | `draft` |
| `publishedAt` | date | — | Optional |
| `tags` | array | — | `[]` |
| `category` | text | — | Optional |
| `seo.seoTitle` | text | — | Optional |
| `seo.ogImage` | text | — | Optional |
| `seo.noindex` | checkbox | — | `false` |
| `cover.url` | text | — | Optional |
| `cover.alt` | text | — | Optional |
| `video.enabled` | checkbox | — | `false` |
| `video.style` | select | — | Optional |
| `links.outbound` | array | — | `[]` |

### Articles (Markdoc)

**Path:** `src/content/articles/{title}/index.mdoc`
**Format:** Markdoc + YAML frontmatter

Additional field: `content: Markdoc`

Features: auto-generated ToC from headings, video manifest support, published articles indexed for search.

### Notes (YAML)

**Path:** `src/content/notes/{title}.yaml`
**Format:** Pure YAML

Additional field: `content: text` (short-form)

Features: quick capture, searchable like articles.

### Records (YAML)

**Path:** `src/content/records/{title}.yaml`
**Format:** Pure YAML

Additional fields:
- `recordType: select` — `project` | `product` | `experiment`
- `recordData: JSON text` — Freeform structured data

Features: flexible portfolio/catalog/research items.

### Site Settings (Singleton)

**Path:** `src/content/site-settings/index.yaml`
**Schema:** Global config (theme ID)

Accessible via Keystatic UI, editable in dev.

## Content Workflow

### Build Pipeline

1. **Edit content** via Keystatic UI at `/keystatic` (dev-only)
2. **Save to disk** as Markdown/YAML files in `src/content/`
3. **Commit to git** (manual or auto via Keystatic webhook)
4. **Build triggers** on Vercel (astro build)
5. **Astro parses** content via `getCollection()` (type-safe)
6. **Output:** Static HTML at `dist/`

### Runtime (No Database)

- **Frontend:** SSG HTML served at build time
- **Search:** Pagefind index generated at build time
- **SSR endpoints:** `/api/manifests/[slug]`, `/og`, `/robots.txt` (use `prerender: false`)

### No Hooks

Keystatic doesn't support afterChange hooks. Video manifest generation is manual:
1. Edit/create article with `video.enabled = true`
2. Manually run: `npm run upload-manifest <slug>` (or manual curl to `/api/manifests/[slug]`)
3. Manifest stored in R2 at `manifests/{slug}.json`

**Note:** Future integration with GitHub Actions could auto-trigger manifest generation on push to main.

## Pages & Routes

### Home Page (`src/pages/index.astro`)

- Lists all published articles + notes
- Uses `getAllPublishedSeeds()` from `content-helpers.ts`
- Seed cards with cover, title, description, date
- Sorted by `publishedAt` descending

### Seed Detail Page (`src/pages/seeds/[slug].astro`)

- Dynamic routing via Astro `getStaticPaths()`
- Fetches single seed (article/note) by slug
- Renders Markdoc via Astro markdown integration
- Auto-generated ToC from headings (React island: `<Toc />`)
- JSON-LD schema injection
- OG image via `/og?title=...&desc=...`

### Search Page (`src/pages/search.astro`)

- Pagefind full-text search UI
- Client-side search (Pagefind index)
- Real-time results as user types
- Min 2-char query guard

### OG Image Route (`src/pages/og.ts`)

- SSR endpoint (dynamic OG generation)
- Params: `title`, `desc`, `style`
- Fallback image if generation fails

### AI/LLM Endpoints (GEO)

- **`/rss.xml`** — RSS feed via `@astrojs/rss` (Bing/ChatGPT search freshness signal)
- **`/llms.txt`** — Lightweight site overview for AI models (llmstxt.org spec, speculative)
- **`/llms-full.txt`** — Extended context with categories, tags, per-article metadata
- All prerendered at build time

### API Routes

- **`/api/manifests/[slug]`** — Video manifest HTTP endpoint (return JSON)
- **`/robots.txt`** — Per-agent AI crawler policy (allow search bots, block training bots)

## Admin Components (2026-03-19)

### Voice Management
| Component | Type | Purpose |
|-----------|------|---------|
| `voice-score-panel.tsx` | React | 6-dimension effectiveness score (emotional, clarity, audience, tone, engagement, authenticity) with AI suggestions |
| `voice-preview-modal.tsx` | React | AI-generated sample paragraphs in voice style (200+ words, language-aware) |

### Architecture
- Voice analysis via `/api/admin/voice-analyze` (Gemini API)
- Voice preview via `/api/admin/voice-preview` (Gemini with system instructions)
- ArrayField enhanced to handle nested objects (`{context, text}` samples)
- i18n module for translations (languages, sub-sections, dynamic key creation)

### Styling (Modularized)
Split `src/styles/admin.css` (1247 LOC → 7 modules):
- `tokens.css` — CSS variables (glass layers, semantic colors)
- `layout.css` — Shell layout (sidebar, topbar, main area)
- `components.css` — UI components (buttons, forms, panels, modals)
- `editor.css` — CodeMirror editor styles
- `table.css` — Content list tables
- `media.css` — Media browser
- `responsive.css` — Mobile breakpoints

## Public Components

| Component | Type | Purpose |
|-----------|------|---------|
| `nav.astro` | Astro | Header, logo, social links, search bar |
| `footer.astro` | Astro | Footer with site info |
| `seed-card.astro` | Astro | Reusable content card |
| `breadcrumb.astro` | Astro | Navigation breadcrumbs |
| `search-pagefind.astro` | Astro | Pagefind search UI wrapper |
| `toc.tsx` | React | Table of contents (client island) |

## Utilities & Helpers

### Content Helpers (`lib/content-helpers.ts`)

**Functions:**
- `getPublishedSeeds(collection)` — Query published articles or notes
- `getAllPublishedSeeds()` — Merge all published articles + notes, sorted by `publishedAt`

All queries filter `status === 'published'` (security-critical to prevent draft leaks).

### Theme Resolver (`lib/get-active-theme-id.ts`)

- Reads theme ID from `site-settings` singleton
- Resolves theme object from `themes/theme-resolver.ts`
- Injects CSS variables into root `<html>` tag

### R2 Utilities (`lib/r2/upload-manifest.ts`)

**Functions:**
- `uploadManifest(slug, manifest)` — Upload JSON to R2 at `manifests/{slug}.json`
- `getManifest(slug)` — Read manifest from R2

Requires `R2_*` env vars (optional for MVP).

### SEO & GEO Generation (`lib/seo/json-ld.ts`)

- `articleJsonLd()` — Article schema with abstract, image, keywords, articleSection, inLanguage
- `websiteJsonLd()` — WebSite schema for homepage
- `breadcrumbJsonLd()` — BreadcrumbList for article pages
- `personJsonLd()` — Person schema for author (renders only when author.name set)
- `safeJsonLd()` — XSS-safe serializer (escapes `</script>`)
- AI meta tags: Dublin Core (DC.title, DC.creator, DC.date), citation_* tags
- robots max-snippet/-1 for full AI extraction

### Site Configuration (`config/site-config.ts`)

Single source of truth for site identity:
- `name`, `description`, `url`
- `author` (name, email, url)
- `socialLinks` (twitter, github, linkedin)
- `theme.id` (active theme)
- `features` (videoFactory, search toggles)
- `r2` (publicUrl)

## Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `PUBLIC_SITE_URL` | Public URL (e.g., `https://my-site.vercel.app`) |

### Optional (R2 Video Manifests)

| Variable | Description |
|----------|-------------|
| `R2_ACCESS_KEY_ID` | S3 access key ID |
| `R2_SECRET_ACCESS_KEY` | S3 secret key |
| `R2_ENDPOINT` | Account endpoint (no `https://`) |
| `R2_BUCKET` | Bucket name |
| `R2_REGION` | Always `auto` |
| `R2_PUBLIC_URL` | Public CDN URL for serving media |

See `.env.example` for full details.

## Naming Conventions

- **Files:** kebab-case (e.g., `site-config.ts`)
- **Components:** kebab-case.astro or PascalCase.tsx (React)
- **Descriptive names** — file name should indicate purpose at a glance

## Deployment

### Vercel

- Build command: `npm run build` (Astro)
- Output directory: `dist/`
- One env var required: `PUBLIC_SITE_URL`
- Keystatic admin (`/keystatic`) locked to dev via environment checks
- SSR endpoints use Vercel Functions

See `vercel.json` and README for deploy button.

## Search

- **Pagefind** static index generated at build time
- Zero runtime cost
- Client-side search on `/search` page
- Min 2-char query guard

## Video Manifests

When `video.enabled = true`:
1. Edit article in Keystatic
2. Manually trigger manifest upload: `npm run upload-manifest <slug>`
3. Manifest stored in R2 at `manifests/{slug}.json`
4. `/api/manifests/[slug]` endpoint returns JSON

**Schema:** See [Video-Factory Contract](./video-factory-contract.md)

## Environment Variables (Updated 2026-03-19)

### New in v2.1.0
| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | No | Google Gemini API for voice analysis + preview generation |

Voice analysis and preview features disabled if not set (graceful degradation).

### GoClaw API Adapter (Phase 1, 2026-03-25)

| Variable | Required | Description |
|----------|----------|-------------|
| `GOCLAW_API_KEY` | No | Bearer token for external AI agent authentication |
| `GOCLAW_WEBHOOK_SECRET` | No | HMAC-SHA256 secret for webhook signature verification |

GoClaw integration disabled (returns 503) if `GOCLAW_API_KEY` not set.

## Feature Module System (2026-03-26)

Optional features managed via a registry-based toggle system. Features can be enabled/disabled in admin settings without code changes.

**Files:**
- `src/lib/admin/feature-registry.ts` — Feature definitions (7 modules: email, goclaw, distribution, analytics, media, voices, translations)
- `src/lib/admin/feature-guard.ts` — Server-side feature guard with caching
- `src/components/admin/feature-toggles-panel.tsx` — Admin UI for feature toggles

**How it works:**
1. **Registry** defines feature metadata (id, label, icon, routes, section)
2. **Settings** (`site-settings.yaml`) stores `enabledFeatures` toggles
3. **UI Layer** — sidebar nav and routes rendered conditionally from `getFeaturesBySection()`
4. **API Layer** — all 20 feature endpoints guarded with `checkFeatureEnabled()` returning 403 when disabled
5. **Public Layer** — email subscribe form and GA4 script hidden when features disabled

**Backward Compatibility:**
- Missing `enabledFeatures` in settings defaults all to enabled (no breaking change)
- Pure functions in registry — easy to test

---

## GoClaw API Adapter Architecture (Phase 1)

External AI agents (orchestration systems like GoClaw) integrate via authenticated REST API:

**Endpoints:**
- `GET /api/goclaw/health` — Service health + version (requires API key)
- `POST /api/goclaw/webhook` — Receive event callbacks (HMAC verified)

**Authentication:**
- Bearer token via `Authorization: Bearer <GOCLAW_API_KEY>` header
- Returns 401 if token invalid, 503 if not configured
- Webhook signature verified via HMAC-SHA256 if `GOCLAW_WEBHOOK_SECRET` set

**Write Policy:**
- All AI agent writes force `status: draft` (human approval required)
- Draft content never public — security-critical

**Files:**
- `src/lib/goclaw/api-auth.ts` — Bearer token verification helper
- `src/lib/goclaw/types.ts` — Shared TypeScript types (WebhookPayload, GoclawApiResponse)
- `src/pages/api/goclaw/health.ts` — Health check endpoint
- `src/pages/api/goclaw/webhook.ts` — Event callback receiver + HMAC verification

**Future Phases:**
- Phase 2: Content CRUD endpoints (`/api/goclaw/content`)
- Phase 3: Voice profile reader (`/api/goclaw/voices`)
- Phase 4: SEO analysis trigger (`/api/goclaw/seo-analyze`)

## Code Standards

- **Astro components:** Default, zero JS
- **React islands:** Only for interactive ToC + search + admin
- **Error handling:** Try-catch with graceful fallbacks
- **File size:** Keep under 200 LOC (modularized CSS as example)
- **Comments:** For complex logic only
- **Styling:** Modular CSS partials, CSS variables for theming

---

**Last updated:** 2026-03-19
