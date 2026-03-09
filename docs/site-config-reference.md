# Site Config Reference

Configuration for Tree Identity is managed through environment variables and Payload CMS admin panel.

## Environment Variables

### Database

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `DATABASE_URL` | string | — | PostgreSQL connection string. Use Supabase pooler port `6543` for serverless |

### App

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NEXT_PUBLIC_SITE_URL` | string | `http://localhost:3000` | Public-facing site URL. Used for SEO, OG images, sitemap |
| `PAYLOAD_SECRET` | string | — | Secret key for Payload CMS auth (min 32 chars) |

### Cloudflare R2 Storage

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `R2_ACCESS_KEY_ID` | string | — | S3-compatible access key ID |
| `R2_SECRET_ACCESS_KEY` | string | — | S3-compatible secret access key |
| `R2_ENDPOINT` | string | — | Account endpoint: `ACCOUNT_ID.r2.cloudflarestorage.com` (no `https://`) |
| `R2_BUCKET` | string | — | Bucket name (e.g. `tree-id-media`) |
| `R2_REGION` | string | `auto` | R2 region, always use `auto` |
| `R2_PUBLIC_URL` | string | — | Public URL for serving media (custom domain or R2 public URL) |

## Content Collections

### Shared Fields (All Seeds)

Every content collection (Articles, Notes, Records) shares these base fields:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `title` | text | — | Content title (required) |
| `description` | textarea | — | Short description (required) |
| `slug` | text | auto-generated | URL slug, auto-derived from title on create |
| `status` | select | `draft` | `draft` or `published` |
| `publishedAt` | date | auto-set | Set automatically when status changes to `published` |
| `tags` | array | `[]` | Array of tag strings |
| `category` | text | — | Category label |
| `seo.seoTitle` | text | — | Custom SEO title override |
| `seo.ogImage` | text | — | Custom OG image URL |
| `seo.noindex` | checkbox | `false` | Exclude from search engine indexing |
| `cover.url` | text | — | Cover image URL |
| `cover.alt` | text | — | Cover image alt text |
| `video.enabled` | checkbox | `false` | Enable video manifest generation |
| `video.style` | select | — | Video style: `cinematic`, `tutorial`, `vlog` |
| `video.sections` | array | `[]` | Video section definitions |
| `links.outbound` | array | `[]` | Outbound link slugs (for future Zettelkasten) |

### Articles

Additional fields beyond shared:

| Field | Type | Description |
|-------|------|-------------|
| `content` | richText (Lexical) | Long-form content with full Lexical editor |

### Notes

| Field | Type | Description |
|-------|------|-------------|
| `content` | textarea | Short-form plain text content |

### Records

| Field | Type | Description |
|-------|------|-------------|
| `recordType` | select | `project`, `product`, or `experiment` |
| `recordData` | JSON | Freeform structured data |

## SEO Configuration

SEO metadata is generated automatically from content fields:

- **Title:** `seo.seoTitle` if set, otherwise `title`
- **Description:** `description` field
- **OG Image:** `seo.ogImage` if set, otherwise auto-generated at `/og?title=...&desc=...`
- **JSON-LD:** Automatically generates `Article` or `CreativeWork` structured data
- **Sitemap:** Generated at `/sitemap.xml` from all published articles and notes
- **Robots:** Configured at `/robots.txt`, respects `seo.noindex` per page

## ISR (Incremental Static Regeneration)

All frontend pages use `revalidate = 3600` (1 hour). Content updates appear within 1 hour without redeployment.

## Video Manifest Integration

When `video.enabled` is `true` and content is published, a JSON manifest is uploaded to R2 at `manifests/{slug}.json`. See [Video-Factory Contract](video-factory-contract.md) for the full schema.
