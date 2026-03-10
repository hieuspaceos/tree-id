# Tree Identity

Your digital twin — a personal content engine. Fork, configure, deploy.

## Quick Start

```bash
git clone https://github.com/hieuspaceos/tree-id.git my-site
cd my-site
npm install
cp .env.example .env.local
npm run dev     # http://localhost:4321
```

Admin panel: http://localhost:4321/keystatic

## Customize (edit ONE file)

Open `src/config/site-config.ts` and set:
- `name` — your site name
- `description` — one-line tagline
- `author` — your name, email, URL
- `socialLinks` — Twitter, GitHub, LinkedIn URLs

## Add Content

1. Visit http://localhost:4321/keystatic
2. Create articles (Markdown), notes (short text), or records (structured data)
3. Content saves as files in `src/content/` — committed to git

Or create files directly:
- Articles: `src/content/articles/my-post/index.mdoc`
- Notes: `src/content/notes/my-note.yaml`
- Records: `src/content/records/my-record.yaml`

## Deploy

```bash
vercel deploy
```

Set one env var on Vercel: `PUBLIC_SITE_URL` = your domain.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PUBLIC_SITE_URL` | Yes | Your deployed URL |
| `R2_*` variables | No | Cloudflare R2 for video manifests |

See `.env.example` for the full list with descriptions.

## Tech Stack

- **Astro 5** — zero JS by default, content-first SSG
- **Keystatic** — git-based CMS, admin UI at /keystatic
- **Pagefind** — static search index, zero runtime cost
- **Tailwind CSS 4** — utility-first with glass morphism theme
- **Vercel** — deployment target

## Extend

| Want to... | Do this... |
|------------|------------|
| Add a theme | Create `src/themes/my-theme.ts`, register in `theme-resolver.ts` |
| Add a page | Create `src/pages/about.astro` |
| Add a collection | Add to `keystatic.config.ts` + `src/content.config.ts` |
| Add an API route | Create `src/pages/api/my-endpoint.ts` |
| Import from WordPress | `npx wordpress-export-to-markdown` then copy to `src/content/` |

## License

MIT
