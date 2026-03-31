---
title: "Phase 4 — Quality Comparison Tables"
status: pending
priority: high
effort: 2h
---

# Phase 4: Quality Comparison Tables

## Overview
Write accurate, research-backed comparison content for each feature vs real competitors. No inflated claims — honest differentiation.

## Landing Page Comparison

**Competitors:** Bolt/Lovable, Carrd, Framer

| Criteria | tree-id | Bolt/Lovable | Carrd | Framer |
|----------|---------|-------------|-------|--------|
| You describe → | ✓ Live page | Code repo | Blank canvas | Template |
| Time to live | ✓ <5 min | 30min (+ deploy) | 1-3h | 1-2h |
| SEO | ✓ Auto JSON-LD + meta | ✗ SPA, Google struggles | Basic meta | Good |
| Edit after | ✓ Visual editor | Code (React) | Drag-drop | Drag-drop |
| AI copy | ✓ Built-in | ✓ Built-in | ✗ None | AI assist |
| Technical skill | ✓ Type words only | Read code | Some design | Design sense |
| Free tier | ✓ 1 page, 3 AI/mo | Limited tokens | 3 sites | Free + badge |
| Paid | $19/mo | $20/mo | $19/yr | $15/mo |

## Blog Comparison

**Competitors:** WordPress, Ghost, Medium, Hashnode

| Criteria | tree-id | WordPress | Ghost | Medium |
|----------|---------|-----------|-------|--------|
| Setup | ✓ 5 min | 30min+ (hosting) | 15min | Instant |
| Own content | ✓ Git files (yours) | DB (exportable) | DB | ✗ Platform-locked |
| AI writing | ✓ Voice AI built-in | Plugins ($) | ✗ None | ✗ None |
| SEO | ✓ Auto JSON-LD | Plugin-heavy | Good | Platform SEO |
| Custom design | ✓ Design tokens | Themes (1000s) | Themes | ✗ No |
| Cost | Free/$19 | $5-30/mo | $9/mo | Free (limited) |
| Newsletter | ✓ Built-in (Resend) | Plugin | ✓ Built-in | ✗ No |

## AI Content Comparison

**Competitors:** ChatGPT/Claude direct, Jasper, Copy.ai

| Criteria | tree-id | ChatGPT/Claude | Jasper | Copy.ai |
|----------|---------|---------------|--------|---------|
| Learns your voice | ✓ Voice profiles | ✗ Prompt each time | Templates | Templates |
| Publishes direct | ✓ To your site | ✗ Copy-paste | ✗ Copy-paste | ✗ Copy-paste |
| SEO optimized | ✓ Auto score + fix | Manual | Basic | Basic |
| Distribution | ✓ Multi-platform | ✗ Manual | ✗ Manual | Social only |
| Price | Included ($19/mo) | $20/mo | $49/mo | $49/mo |

## AI Chatbot Comparison

**Competitors:** Intercom, Crisp, ChatBot.com

| Criteria | tree-id | Intercom | Crisp | ChatBot.com |
|----------|---------|----------|-------|-------------|
| Train on your data | ✓ Auto from site | ✓ Docs/URLs | ✓ URLs | ✓ URLs |
| Setup | ✓ 1 click enable | Complex | Moderate | Moderate |
| Integrated with site | ✓ Native | Embed widget | Embed | Embed |
| Price | Usage-based | $74/mo+ | $25/mo | $52/mo |
| AI quality | Gemini/Claude | GPT-4 | GPT | GPT |

## Writing Guidelines
- Every claim must be verifiable (check competitor pricing pages)
- Use ✓/✗ only for clear yes/no — text descriptions for nuanced differences
- Acknowledge where competitors are genuinely better (e.g. WordPress themes, Framer design)
- Price = current public pricing as of 2026-03

## Files to Modify
- `src/content/landing-pages/home.yaml` — comparison data in each featureProduct

## Todo
- [ ] Verify competitor pricing (web search if needed)
- [ ] Write landing comparison (7 rows × 4 columns)
- [ ] Write blog comparison (7 rows × 4 columns)
- [ ] Write ai-content comparison (5 rows × 4 columns)
- [ ] Write chatbot comparison (5 rows × 4 columns)
- [ ] Review for accuracy — no false claims
