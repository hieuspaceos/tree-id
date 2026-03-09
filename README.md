# Tree Identity

Your digital twin — a personal content engine that turns ideas into articles, notes, and video-ready manifests.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fhieuspaceos%2Ftree-id&env=DATABASE_URL,PAYLOAD_SECRET,NEXT_PUBLIC_SITE_URL&envDescription=Required%20environment%20variables%20for%20Tree%20Identity&envLink=https%3A%2F%2Fgithub.com%2Fhieuspaceos%2Ftree-id%23environment-variables)

## Quick Start — CLI (Recommended)

```bash
npx create-tree-id my-site
cd my-site
npm run dev
```

The CLI scaffolds a new project, prompts for Supabase + R2 credentials, and writes your `.env.local`.

## Quick Start — Manual

```bash
git clone https://github.com/hieuspaceos/tree-id.git
cd tree-id
cp .env.example .env.local   # fill in your values
npm install
npx payload migrate          # run database migrations
npm run dev                   # http://localhost:3000
```

Admin panel: `http://localhost:3000/admin` — create your first user on first visit.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Supabase PostgreSQL connection string (pooler port `6543` for serverless) |
| `PAYLOAD_SECRET` | Yes | Random secret, min 32 chars. Generate: `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | Yes | Your deployed URL (e.g. `https://my-site.vercel.app`) |
| `R2_ACCESS_KEY_ID` | No | Cloudflare R2 S3-compatible access key |
| `R2_SECRET_ACCESS_KEY` | No | Cloudflare R2 S3-compatible secret key |
| `R2_ENDPOINT` | No | R2 endpoint: `ACCOUNT_ID.r2.cloudflarestorage.com` (no `https://`) |
| `R2_BUCKET` | No | R2 bucket name (e.g. `tree-id-media`) |
| `R2_REGION` | No | R2 region (use `auto`) |
| `R2_PUBLIC_URL` | No | Public URL for serving media files |

> R2 variables are optional — media uploads and video manifests require them, but the site runs without them.

## Tech Stack

- **Next.js 15** — App Router, React 19, server components
- **Payload CMS 3** — Embedded admin, Lexical rich-text editor
- **PostgreSQL** — Supabase hosted, pooled connections
- **Cloudflare R2** — S3-compatible media storage
- **Tailwind CSS 4** — Utility-first styling with `@tailwindcss/typography`
- **Vercel** — Deployment target, Edge OG image generation

## Project Structure

```
src/
├── app/
│   ├── (frontend)/          # Public pages (home, seeds/[slug], search)
│   ├── (payload)/           # Payload admin panel
│   ├── api/manifests/       # Video manifest API
│   ├── og/                  # OG image generation (Edge)
│   ├── sitemap.ts
│   └── robots.ts
├── collections/             # Payload collection configs + hooks
├── components/              # React components (nav, seed-card, toc, etc.)
└── lib/
    ├── payload-helpers.ts   # DB query helpers
    ├── r2/                  # R2 upload/read utilities
    └── seo/                 # Metadata + JSON-LD generators
```

## Collections

| Collection | Description |
|------------|-------------|
| **Articles** | Long-form content with Lexical rich text, ToC, video manifest support |
| **Notes** | Short-form content with plain textarea |
| **Records** | Structured data (projects, products, experiments) with JSON field |
| **Media** | File uploads stored in Cloudflare R2 |
| **Users** | Authentication for admin panel |

## Documentation

- [Video-Factory Contract](docs/video-factory-contract.md) — Manifest schema and integration guide
- [Site Config Reference](docs/site-config-reference.md) — All configuration fields

## License

MIT
