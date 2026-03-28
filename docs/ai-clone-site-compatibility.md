# AI Clone — Site Compatibility Analysis

How the AI Wizard analyzes and clones landing pages, and which sites work best.

## How It Works

1. Fetch HTML from URL (server-side, no browser)
2. Strip scripts, styles, SVGs, comments
3. Send cleaned HTML + user intent to Gemini 2.5 Flash
4. Gemini extracts: sections, design tokens (colors, fonts), content
5. User reviews detected sections → picks which to apply

## Site Classification

### Tier 1 — High Compatibility (90%+ success)

**Characteristics:**
- SSR/SSG framework (Next.js, Astro, Nuxt, Hugo, Jekyll)
- Content rendered server-side (visible in raw HTML)
- Semantic HTML tags: `<section>`, `<nav>`, `<footer>`, `<header>`, `<h1-h6>`
- Cleaned HTML < 50K chars
- < 1000 content words
- External CSS (not inline)
- Clear heading hierarchy

**Examples:** claudekit.cc, most SaaS landing pages, marketing sites, documentation sites

**Why it works:** Gemini receives structured HTML with clear section boundaries. Content is directly in the HTML, no JS execution needed.

### Tier 2 — Medium Compatibility (50-70% success)

**Characteristics:**
- Server-rendered but heavy HTML (50K-150K cleaned)
- Lots of inline styles or class attributes
- Many images/galleries
- > 1000 words
- Some semantic tags but mixed with generic divs

**Examples:** WordPress sites (PHP-rendered), Wix, Squarespace, Shopify

**Common issues:**
- JSON output may be truncated (too much content)
- Some sections may be missed or merged
- Rich-text sections may contain raw HTML

**Workaround:** Use "Paste Code" mode — copy only the main content area, not entire page source.

### Tier 3 — Low Compatibility (< 30% success)

**Characteristics:**
- SPA/CSR framework (React, Angular, Vue without SSR)
- Content rendered client-side via JavaScript
- Raw HTML is mostly empty shell + script tags
- < 30 words in cleaned HTML
- Cloudflare/bot protection
- No semantic HTML tags

**Examples:** Single-page apps, admin dashboards, heavily protected sites, JS-only WordPress themes

**Why it fails:** Server fetch returns empty HTML — content only exists after JavaScript executes in a browser.

**Workaround:** "Paste Code" mode:
1. Open page in Chrome
2. Right-click → Inspect
3. Select `<body>` tag
4. Right-click → Copy → Copy outerHTML
5. Paste into AI Wizard Code tab

## Quick Reference

| Signal | Good | Bad |
|--------|------|-----|
| `<section>` tags | 3+ sections | 0 sections |
| `<h1>`, `<h2>` | Clear hierarchy | None |
| Words after clean | 100-800 | < 30 or > 2000 |
| HTML after clean | 10K-50K chars | < 500 or > 100K |
| Framework | Next.js SSR, Astro, Hugo | React SPA, Angular |
| CSS | External stylesheets | 200K+ inline styles |
| `<nav>`, `<footer>` | Present | Missing |
| `<img>` tags | Direct src URLs | Lazy-loaded / JS |

## Gemini API Details

- **Model:** Gemini 2.5 Flash
- **Max output:** 32,768 tokens
- **Response format:** `application/json` (structured output)
- **Temperature:** 0.2 (deterministic)
- **Cost:** ~$0.001-0.005 per clone

## Future Improvements (Backlog)

- Chunked analysis for large sites (split HTML into chunks, merge sections)
- Screenshot-based analysis via Gemini Vision (visual layout detection)
- Jina Reader integration for JS-rendered content
- Headless browser (Puppeteer) for full SPA support
- Pre-clone compatibility score displayed in wizard
