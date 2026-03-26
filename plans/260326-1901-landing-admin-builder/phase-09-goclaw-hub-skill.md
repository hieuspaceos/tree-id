# Phase 9: GoClaw Hub Skill Integration

## Context Links
- [plan.md](plan.md) | [phase-07](phase-07-goclaw-landing-api.md)
- GoClaw Hub: `C:/Users/hieuspace/Desktop/CODE/goclaw-hub/`
- GoClaw skills dir: `goclaw-hub/skills/`
- GoClaw tool: `internal/tools/use_skill.go`, `internal/tools/web_fetch.go`

## Overview
- **Priority:** P2
- **Status:** pending
- **Effort:** 3h
- **Depends on:** Phase 7 (tree-id API endpoints must exist first)

Create a GoClaw Hub skill "tree-id-manager" that enables agents to orchestrate tree-id landing pages and entities via REST API. Approach A — skill-based, no Go code changes.

## Key Insights

- GoClaw Hub has `use_skill` tool — agents load skills that define available actions
- Skills are YAML + prompt files in `goclaw-hub/skills/` directory
- `web_fetch` tool already handles HTTP requests with headers — perfect for Bearer auth
- Hub's team task system dispatches agents in parallel — each agent works on 1 section
- No changes to GoClaw Hub Go code needed

## Requirements

### Functional
- Skill file `tree-id-manager.yaml` with system prompt describing all tree-id API endpoints
- Agent can: list sections, read/write individual sections, create entities, trigger setup
- Hub can dispatch multiple agents, each targeting different sections (parallel)
- Bearer auth token passed via skill config or agent credentials

### Non-functional
- Skill works with any tree-id instance (configurable base URL)
- Graceful error handling when tree-id unreachable
- No GoClaw Hub code changes (pure skill definition)

## Architecture

```
GoClaw Hub
├── skills/
│   └── tree-id-manager/
│       ├── skill.yaml       ← Skill definition (name, description, config)
│       └── prompt.md        ← System prompt with API reference
│
├── Agent receives task: "Create landing for chatbot SaaS"
│   └── Agent loads skill "tree-id-manager"
│       └── System prompt tells agent about available endpoints
│           └── Agent calls web_fetch:
│               POST https://{TREE_ID_URL}/api/goclaw/landing/sections
│               Authorization: Bearer {TREE_ID_API_KEY}
│               Body: { "type": "hero", "data": {...} }
```

### Orchestration Flow (Hub dispatches team)

```
Hub Lead Agent
├── Parses task: "Landing page for chatbot, 3 pricing tiers"
├── Creates subtasks:
│   ├── Task 1: "Write hero section" → Agent A
│   ├── Task 2: "Write features section" → Agent B
│   ├── Task 3: "Create pricing plans" → Agent C
│   ├── Task 4: "Generate FAQ" → Agent D
│   └── Task 5: "Write testimonials" → Agent E
│
├── Each agent:
│   ├── Loads skill "tree-id-manager"
│   ├── Reads current config: GET /api/goclaw/landing/config
│   ├── Writes their section: PUT /api/goclaw/landing/sections/{type}
│   └── Reports completion to lead
│
└── Lead verifies all sections → signals human review
```

## Related Code Files

### Create (in goclaw-hub repo)
- `goclaw-hub/skills/tree-id-manager/skill.yaml` — skill definition
- `goclaw-hub/skills/tree-id-manager/prompt.md` — API reference + instructions

### No Changes
- GoClaw Hub Go code — unchanged
- Tree-ID source code — unchanged (API from Phase 7 already exists)

## Implementation Steps

### Step 1: Create skill directory
```bash
mkdir -p goclaw-hub/skills/tree-id-manager/
```

### Step 2: Create `skill.yaml`
```yaml
name: tree-id-manager
description: Manage Tree Identity landing pages, sections, and entities via REST API
version: 1.0.0

config:
  tree_id_url:
    description: "Tree Identity base URL (e.g., https://tree-id.dev)"
    required: true
  tree_id_api_key:
    description: "GoClaw API key for tree-id (Bearer token)"
    required: true

tools:
  - web_fetch  # Agent uses web_fetch to call tree-id API

tags:
  - landing-page
  - content-management
  - tree-identity
```

### Step 3: Create `prompt.md` — API reference for agents

```markdown
# Tree Identity Manager

You manage a Tree Identity instance at `{TREE_ID_URL}`.
All requests require: `Authorization: Bearer {TREE_ID_API_KEY}`

## Available Endpoints

### Landing Page

| Action | Method | Endpoint |
|--------|--------|----------|
| Get full config | GET | /api/goclaw/landing/config |
| Update full config | PUT | /api/goclaw/landing/config |
| List sections | GET | /api/goclaw/landing/sections |
| Read section | GET | /api/goclaw/landing/sections/{sectionId} |
| Create section | POST | /api/goclaw/landing/sections |
| Update section | PUT | /api/goclaw/landing/sections/{sectionId} |
| Delete section | DELETE | /api/goclaw/landing/sections/{sectionId} |

### Entities

| Action | Method | Endpoint |
|--------|--------|----------|
| List entity schemas | GET | /api/goclaw/entities |
| List entity items | GET | /api/goclaw/entities/{name} |
| Create entity item | POST | /api/goclaw/entities/{name} |
| Read entity item | GET | /api/goclaw/entities/{name}/{slug} |
| Update entity item | PUT | /api/goclaw/entities/{name}/{slug} |

### Content (existing)

| Action | Method | Endpoint |
|--------|--------|----------|
| List collection | GET | /api/goclaw/content/{collection} |
| Create entry | POST | /api/goclaw/content/{collection} |
| Read entry | GET | /api/goclaw/content/{collection}/{slug} |
| Update entry | PUT | /api/goclaw/content/{collection}/{slug} |

### Setup

| Action | Method | Endpoint |
|--------|--------|----------|
| AI setup | POST | /api/goclaw/setup |

## Section Types

Available section types for landing pages:
hero, features, pricing, testimonials, faq, cta, stats, how-it-works, team, logo-wall

## Rules

1. Always check current config before making changes
2. Write one section at a time — don't overwrite other agents' work
3. All content in English unless instructed otherwise
4. Keep copy concise and conversion-focused
5. Pricing plans must include name, price, and features array
```

### Step 4: Test the skill

1. Start tree-id locally: `npm run dev` (port 4321)
2. Set env vars: `GOCLAW_API_KEY=test-key`
3. Start GoClaw Hub with skill loaded
4. Send test message to Hub: "Create a hero section for my chatbot product"
5. Verify Hub agent calls `web_fetch` to tree-id API
6. Verify section created in `src/content/landing-pages/home.yaml`

## Todo List

- [ ] Create `goclaw-hub/skills/tree-id-manager/` directory
- [ ] Write `skill.yaml` with config (url, api_key)
- [ ] Write `prompt.md` with full API reference
- [ ] Test single agent → single section write
- [ ] Test team dispatch → parallel section writes
- [ ] Test error handling (tree-id down, invalid API key)
- [ ] Document skill in goclaw-hub README

## Success Criteria

- Agent can list/read/write landing sections via skill
- Multiple agents can write different sections in parallel without conflicts
- Skill works with any tree-id instance (configurable URL)
- No GoClaw Hub Go code modified
- Hub team task system dispatches correctly

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| web_fetch doesn't support custom headers | Low | GoClaw web_fetch already supports headers — verify |
| Parallel writes cause YAML corruption | Medium | Each section has unique key in YAML — no conflict if agents write different sections |
| Skill config not exposed to agents | Low | Verify use_skill tool passes config values to agent context |
| Tree-id API latency too high for agents | Low | Agents are async — latency acceptable. Optimize later with native tool (Approach B) |

## Future: Approach B (Native Go Tool)

When to upgrade from skill to native tool:
- Skill validated, flow works end-to-end
- Need lower latency (skip web_fetch overhead)
- Need typed Go structs for tree-id API
- Need connection pooling or caching

Implementation: `goclaw-hub/internal/tools/tree_id.go` — native HTTP client with typed API.
Effort: ~5h additional. Not needed for MVP.

## Next Steps

- Validate with real GoClaw Hub instance
- Test multi-agent parallel section writes
- If successful → document in tree-id README as integration guide
