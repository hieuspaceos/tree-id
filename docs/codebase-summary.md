# Tree Identity MVP — Codebase Summary

**Project:** Tree Identity MVP
**Status:** Complete (Phases 1-7)
**Last Updated:** 2026-03-09
**Stack:** Next.js 15 + Payload CMS 3 + PostgreSQL + Cloudflare R2

## Overview

Tree Identity is a personal content engine that turns ideas into articles, notes, and video-ready manifests. It combines a Next.js frontend with an embedded Payload CMS admin panel, PostgreSQL database, and Cloudflare R2 storage for media assets.

The codebase implements a 7-phase MVP:
1. **Phase 1** — Next.js 15 + Payload CMS 3 scaffolding
2. **Phase 2** — Collections (Articles, Notes, Records, Media, Users) with schemas and hooks
3. **Phase 3** — `create-tree-id` CLI tool for automated project setup
4. **Phase 4** — Frontend interface with navigation, seed cards, search, ToC, and detail pages
5. **Phase 5** — SEO engine (metadata generation, JSON-LD, OG images, sitemap)
6. **Phase 6** — Video manifest hook and R2 manifest API endpoint
7. **Phase 7** — Vercel deployment button and documentation

## Architecture

### Tech Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | Next.js | 15 | React 19 with App Router, server components |
| CMS | Payload CMS | 3.79.0 | Embedded admin panel, Lexical editor |
| Database | PostgreSQL | Supabase | Hosted relational database |
| Storage | Cloudflare R2 | S3-compatible | Media uploads, video manifests |
| Styling | Tailwind CSS | 4.0 | Utility-first CSS with typography plugin |
| Deploy | Vercel | — | Edge functions for OG images |

### Key Design Decisions

- **No component library** — Plain Tailwind CSS (v4) + custom components, no shadcn/ui
- **Embedded CMS** — Payload runs alongside Next.js, no external admin server
- **Server components** — Default to server components, `'use client'` only for interactive UI (ToC, search)
- **ISR strategy** — All pages revalidate every 3600 seconds (1 hour) for cache efficiency
- **Video manifests as files** — JSON files in R2 (not API-stored), with HTTP endpoint for access
- **Typed content schemas** — Inline Payload collection definitions with TypeScript support

## Directory Structure

```
tree-id/
├── src/
│   ├── app/
│   │   ├── (frontend)/              # Public pages (route group)
│   │   │   ├── layout.tsx           # Frontend layout with nav
│   │   │   ├── page.tsx             # Home page
│   │   │   ├── search/page.tsx      # Full-text search
│   │   │   └── seeds/[slug]/page.tsx # Detail page with ToC
│   │   ├── (payload)/               # Payload admin (route group)
│   │   │   ├── admin/[[...segments]]/page.tsx
│   │   │   ├── admin/[[...segments]]/not-found.tsx
│   │   │   ├── api/[...slug]/route.ts
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   └── manifests/[slug]/route.ts # Video manifest HTTP API
│   │   ├── og/route.tsx             # OG image generation (Edge)
│   │   ├── sitemap.ts               # SEO sitemap
│   │   ├── robots.ts                # SEO robots.txt
│   │   ├── layout.tsx               # Root layout
│   │   └── globals.css              # Global styles
│   ├── collections/                 # Payload collection configs
│   │   ├── Articles.ts
│   │   ├── Notes.ts
│   │   ├── Records.ts
│   │   ├── Media.ts
│   │   ├── Users.ts
│   │   ├── fields/
│   │   │   └── base-seed-fields.ts # Shared fields for all content
│   │   └── hooks/
│   │       ├── auto-slug.ts        # Auto-generate slug from title
│   │       ├── set-published-at.ts # Set timestamp on publish
│   │       ├── revalidate-page.ts  # ISR revalidation
│   │       └── generate-video-manifest.ts # Video manifest generation
│   ├── components/                  # React components
│   │   ├── nav.tsx                 # Header navigation
│   │   ├── seed-card.tsx           # Content card component
│   │   ├── breadcrumb.tsx          # Breadcrumb navigation
│   │   ├── toc.tsx                 # Table of contents (client)
│   │   ├── search-input.tsx        # Search box (client)
│   │   └── lexical-renderer.tsx    # Lexical rich-text renderer
│   ├── lib/
│   │   ├── payload-helpers.ts      # DB query utilities
│   │   ├── r2/
│   │   │   └── upload-manifest.ts  # R2 manifest upload/read
│   │   └── seo/
│   │       ├── generate-metadata.ts # Next.js metadata generation
│   │       └── json-ld.ts          # JSON-LD schema generation
│   ├── config/
│   │   └── site-config.ts          # Site-wide configuration
│   └── payload.config.ts           # Payload CMS configuration
├── packages/create-tree-id/        # CLI package (npm create-tree-id)
│   ├── bin/cli.js                 # Entry point
│   ├── src/
│   │   ├── index.ts               # Main CLI logic
│   │   ├── supabase-api.ts        # Supabase setup helper
│   │   ├── cloudflare-api.ts      # Cloudflare R2 helper
│   │   ├── env-writer.ts          # .env.local writer
│   │   └── migrations-runner.ts   # Database migration runner
│   ├── package.json
│   ├── tsconfig.json
│   └── tsup.config.ts
├── docs/
│   ├── video-factory-contract.md   # Manifest schema + integration guide
│   ├── site-config-reference.md    # Configuration field reference
│   └── codebase-summary.md         # This file
├── plans/                          # Implementation plans and phase docs
├── .env.example                    # Environment variables template
├── .repomixignore                  # Repomix ignore patterns
├── CLAUDE.md                       # Claude Code instructions
├── AGENTS.md                       # OpenCode instructions
├── next.config.ts
├── tsconfig.json
├── package.json
├── vercel.json                     # Vercel deployment config
└── README.md                       # Project overview + quick start
```

## Collections & Schemas

All content collections (Articles, Notes, Records) inherit base fields from `base-seed-fields.ts`.

### Shared Fields (All Seed Types)

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `title` | Text | Content title (required) | — |
| `description` | Textarea | Short description (required) | — |
| `slug` | Text | URL slug, auto-generated from title | — |
| `status` | Select | `draft` or `published` | `draft` |
| `publishedAt` | Date | Timestamp when published | Auto-set |
| `tags` | Array | Tag strings | `[]` |
| `category` | Text | Category label | — |
| `seo.seoTitle` | Text | Custom SEO title | — |
| `seo.ogImage` | Text | Custom OG image URL | — |
| `seo.noindex` | Checkbox | Exclude from indexing | `false` |
| `cover.url` | Text | Cover image URL | — |
| `cover.alt` | Text | Cover image alt text | — |
| `video.enabled` | Checkbox | Enable video manifest generation | `false` |
| `video.style` | Select | `cinematic`, `tutorial`, or `vlog` | — |
| `video.sections` | Array | Video section definitions | `[]` |
| `links.outbound` | Array | Outbound link references (future use) | `[]` |

### Articles

Long-form content with Lexical rich-text editor.

**Additional Fields:**
- `content: RichText` — Lexical editor with full formatting support

**Features:**
- Auto-generated table of contents from headings
- Video manifest support when `video.enabled = true`
- Published articles appear on frontend and in search index

### Notes

Short-form plain-text content.

**Additional Fields:**
- `content: Textarea` — Plain text (no Lexical formatting)

**Features:**
- Quick capture for brief ideas
- Searchable and indexable like articles

### Records

Structured data for projects, products, experiments.

**Additional Fields:**
- `recordType: Select` — `project`, `product`, or `experiment`
- `recordData: JSON` — Freeform JSON object for custom fields

**Features:**
- Flexible schema via JSON field
- Useful for portfolio items, product catalogs, research data

### Media

File uploads stored in Cloudflare R2.

- Uses Payload's built-in `media` collection for S3 integration
- Configured in `payload.config.ts`

### Users

Authentication for admin panel (Payload built-in).

## Hooks & Lifecycle

All content collections use four shared hooks:

### 1. Auto-Slug (`auto-slug.ts`)

**Trigger:** `beforeValidate` on create
**Action:** Auto-generates `slug` from `title` if not provided
**Example:** "My Article Title" → `my-article-title`

### 2. Set Published-At (`set-published-at.ts`)

**Trigger:** `beforeChange` when `status` → `published`
**Action:** Sets `publishedAt` timestamp
**Effect:** Non-blocking; fails gracefully if date already set

### 3. Revalidate Page (`revalidate-page.ts`)

**Trigger:** `afterChange` on any published seed
**Action:** Calls `revalidatePath()` for ISR invalidation
**Purpose:** Ensures frontend cache refreshes after edits

### 4. Generate Video Manifest (`generate-video-manifest.ts`)

**Trigger:** `afterChange` when `status === 'published' && video.enabled === true`
**Action:** Uploads manifest to R2 at `manifests/{slug}.json`
**Schema:** Conforms to [Video-Factory Contract](./video-factory-contract.md)
**Error Handling:** Non-blocking — content save succeeds even if R2 fails

## Frontend Architecture

### Pages & Routes

All frontend pages use `revalidate = 3600` for ISR.

#### Home Page (`(frontend)/page.tsx`)

- Lists all published articles and notes
- Uses `getPublishedSeeds()` helper
- Parallel queries for efficiency
- Seed cards with cover image, title, description, date

#### Seed Detail Page (`(frontend)/seeds/[slug]/page.tsx`)

- Server component with dynamic slug routing
- Parallel queries: content + metadata
- Renders rich-text via Lexical renderer
- Auto-generated table of contents from headings
- JSON-LD structured data injection
- Custom OG image via `/og?title=...&desc=...`

#### Search Page (`(frontend)/search/page.tsx`)

- Full-text search across articles + notes
- Payload search plugin integration
- Min 2-char query guard
- Real-time results as client component

#### OG Image Route (`app/og/route.tsx`)

- Edge function for dynamic OG image generation
- Params: `title`, `desc`, `style`
- Params truncated for safety (`.slice(0, 100)`)
- Fallback to default image if generation fails

### Components

#### Navigation (`components/nav.tsx`)

- Server component
- Logo, home link, search input
- Responsive mobile menu (future enhancement)

#### Seed Card (`components/seed-card.tsx`)

- Reusable card for content preview
- Cover image, title, description, date
- Links to detail page

#### Table of Contents (`components/toc.tsx`)

- Client component with scroll spy
- Extracts headings from Lexical doc
- Highlights active section
- Smooth scroll behavior

#### Search Input (`components/search-input.tsx`)

- Client component
- Debounced API calls
- Real-time results dropdown

#### Lexical Renderer (`components/lexical-renderer.tsx`)

- Custom Lexical renderer for rich-text
- Heading converter: adds `id` attrs for ToC anchors
- Supports images, lists, quotes, code blocks

## Configuration & Utilities

### Payload Helpers (`lib/payload-helpers.ts`)

**Functions:**

- `getPayloadClient()` — Initialize Payload instance with DB connection
- `getPublishedSeeds()` — Query all published articles + notes (parallel)
- `getSeedBySlug(slug)` — Get single seed by slug with status filter (security-critical)

**Database Filtering:**
```typescript
status: { equals: 'published' }
```
All frontend queries apply this filter to prevent draft content leaks.

### R2 Utilities (`lib/r2/upload-manifest.ts`)

**Functions:**

- `uploadManifest(slug, manifest)` — Upload JSON manifest to R2
- `getManifest(slug)` — Read manifest from R2

**Manifest Location:**
```
s3://{R2_BUCKET}/manifests/{slug}.json
```

### SEO Generation

#### Metadata Generator (`lib/seo/generate-metadata.ts`)

- Generates Next.js metadata object for each page
- Uses `seo.seoTitle` or fallback to `title`
- Includes OG image, canonical URL, robots
- Called from layout + detail page

#### JSON-LD Generator (`lib/seo/json-ld.ts`)

- Creates structured data for search engines
- Article type for articles, CreativeWork for notes
- Includes author, date published, URL

### Site Configuration (`config/site-config.ts`)

Centralized config for:
- Site name, description
- Author info
- Social links
- Deployment URL (from env)

## Create-Tree-ID CLI Package

Located in `packages/create-tree-id/`, scaffolds a new Tree Identity project.

### Features

1. **Project Setup** — Creates project directory with git init
2. **Supabase** — Prompts for credentials, creates database + user
3. **Cloudflare R2** — Validates R2 bucket and credentials
4. **Environment Writer** — Generates `.env.local` with all secrets
5. **Database Migrations** — Runs Payload migrations on fresh DB
6. **Dependencies** — Installs npm packages

### Files

- `bin/cli.js` — Entry point (executable)
- `src/index.ts` — Main CLI logic, orchestration
- `src/supabase-api.ts` — Supabase REST API client
- `src/cloudflare-api.ts` — Cloudflare API client
- `src/env-writer.ts` — Writes `.env.local` file
- `src/migrations-runner.ts` — Runs `npx payload migrate`

### Usage

```bash
npx create-tree-id my-site
cd my-site
npm run dev
```

## Environment Variables

### Core (Required)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase PostgreSQL (use pooler port `6543` for serverless) |
| `PAYLOAD_SECRET` | Min 32 chars, generated with `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | Public URL (e.g., `https://my-site.vercel.app`) |

### R2 Storage (Optional for MVP)

| Variable | Description |
|----------|-------------|
| `R2_ACCESS_KEY_ID` | S3 access key |
| `R2_SECRET_ACCESS_KEY` | S3 secret key |
| `R2_ENDPOINT` | Account endpoint (no `https://`) |
| `R2_BUCKET` | Bucket name |
| `R2_REGION` | Always `auto` |
| `R2_PUBLIC_URL` | Public CDN URL for media |

## Deployment

### Vercel

Project includes `vercel.json` with:
- Build command: `npm run build`
- Output directory: `.next`
- Environment variable definitions with descriptions
- Deploy button in README

**Configuration:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "env": [
    { "key": "DATABASE_URL", "required": true },
    { "key": "PAYLOAD_SECRET", "required": true },
    ...
  ]
}
```

### ISR & Caching

- All frontend pages: `revalidate = 3600` (1 hour)
- OG images: Cached by Vercel Edge
- Sitemap: Revalidated on publish
- Content updates appear within 1 hour

## Search Implementation

- Payload search plugin indexes articles + notes
- Min 2-char query guard
- Full-text search across title, slug, tags
- Results paginated on `/search?q=...`
- Real-time client-side filtering

## Video Manifest Integration

When `video.enabled = true` and content is published:

1. `generateVideoManifest` hook fires after save
2. Manifest uploaded to R2: `s3://{R2_BUCKET}/manifests/{slug}.json`
3. HTTP API endpoint: `/api/manifests/{slug}` with cache headers
4. video-factory service consumes manifest and generates video

**Schema:** See [Video-Factory Contract](./video-factory-contract.md)

## Code Quality & Standards

### File Naming

- **TypeScript:** kebab-case (e.g., `auto-slug.ts`)
- **React Components:** PascalCase (e.g., `SearchInput.tsx`)
- **Descriptive names** — File name should indicate purpose at a glance

### File Size

- **Target:** Keep files under 200 LOC (lines of code)
- **Modularization:** Large files split into smaller focused modules
- **Collections:** Separated into base fields + individual collection configs

### Code Style

- **Typescript:** Strict mode enabled
- **Server Components:** Default, `'use client'` only for interactivity
- **Error Handling:** Try-catch for async operations, graceful fallbacks
- **Comments:** Added for complex logic (hooks, queries, transformations)

### Testing

- No unit tests in MVP (Phase 7)
- Manual testing via admin panel + frontend pages
- Consider adding tests in Phase 8+

## Documentation

### Docs Directory Structure

```
docs/
├── codebase-summary.md         # This file — architecture overview
├── video-factory-contract.md   # Manifest schema + integration
└── site-config-reference.md    # Configuration field reference
```

### Key Docs

- **README.md** — Quick start, tech stack, collections overview
- **Video-Factory Contract** — Manifest schema, HTTP API, versioning policy
- **Site Config Reference** — All configuration fields, defaults, SEO setup

## Key Insights & Conventions

### Design Principles

1. **Embedded CMS** — No separate admin server, runs alongside Next.js
2. **Type Safety** — Full TypeScript support in collection definitions
3. **ISR First** — All pages use incremental static regeneration for cache efficiency
4. **File-Based Manifests** — Video manifests stored in R2, not database
5. **Security by Default** — All frontend queries filter `status === 'published'`

### Important Conventions

- `status: 'published'` filter applied to **all frontend queries** (critical security)
- `revalidate = 3600` on **all frontend pages** (ISR cache)
- `'use client'` used **only in interactive components** (ToC, search input, OG route excluded)
- Hooks are **non-blocking** (content save succeeds even if hook fails)
- **Environment variables** must be set before deployment (Vercel requires `DATABASE_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SITE_URL`)

### Performance Considerations

- Parallel queries for home page + seed detail (both article + metadata)
- Lexical renderer optimized for server-side rendering
- OG image generation at Edge (no server compute needed)
- Sitemap generated at build/revalidation time
- Search min 2-char guard prevents spam queries

## Unresolved Questions / Future Enhancements

1. **Phase 8** — Add unit + integration tests (Jest, Playwright)
2. **Phase 9** — Implement Zettelkasten linking (use `links.outbound` field)
3. **Phase 10** — Add user authentication for personal site protection
4. **Phase 11** — Analytics integration (Vercel Analytics or Plausible)
5. **Phase 12** — Mobile responsiveness + dark mode toggle
6. **Payload Types** — `payload-types.ts` generation when Payload CLI adds type generation feature

---

**Generated by:** docs-manager subagent
**Date:** 2026-03-09
**Repomix Version:** 1.12.0
