# Phase 3: `create-tree-id` CLI Tool

## Context Links
- [CLI Research](../reports/researcher-260305-1704-create-tree-id-cli-research.md)

## Overview
- **Priority:** P2
- **Status:** Complete
- **Effort:** 6h
- **Depends on:** None (independent package)
- Build `npx create-tree-id` CLI that provisions Supabase project + R2 bucket, writes `.env.local`, runs migrations

## Key Insights
- Lives in `packages/create-tree-id/` — separate npm package
- Uses `@clack/prompts` for beautiful interactive CLI (same as Astro, Nuxt)
- Supabase Management API: `POST /v1/projects` → poll until ACTIVE
- Cloudflare R2 API: `POST /accounts/{id}/r2/buckets` → set CORS
- Must handle graceful fallback when user skips API tokens (manual setup instructions)
- `tsup` for zero-config TypeScript bundling to ESM+CJS

## Requirements

### Functional
- `npx create-tree-id my-site` clones template + provisions infra
- Interactive prompts: site name, Supabase token, CF token (all skippable)
- Auto-create Supabase project if token provided
- Auto-create R2 bucket + CORS if token provided
- Generate `.env.local` with all credentials
- Run `npm install` + `npx payload migrate`
- Print success message with next steps + Vercel deploy URL

### Non-Functional
- Works on Node 18+
- Works on Windows, macOS, Linux
- Timeout: 2 min max for provisioning
- Graceful Ctrl+C handling throughout

## Architecture

```
packages/create-tree-id/
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── bin/
│   └── cli.js          # Shebang entry: #!/usr/bin/env node
└── src/
    ├── index.ts         # Main CLI flow
    ├── supabase-api.ts  # Supabase Management API client
    ├── cloudflare-api.ts # CF R2 API client
    ├── env-writer.ts    # .env.local generation
    └── migrations-runner.ts # spawn payload migrate
```

### CLI Flow Diagram
```
Welcome → Site Name → Supabase Token?
  → Yes: Org select → Create project → Poll ACTIVE → Get DB URL
  → No:  Print manual Supabase setup instructions

→ CF Token?
  → Yes: Account ID → Create bucket → Set CORS → Get R2 creds
  → No:  Print manual R2 setup instructions

→ Write .env.local (backup existing)
→ npm install
→ npx payload migrate
→ Print success + dev command + Vercel deploy URL
```

## Related Code Files

### Create
- `packages/create-tree-id/package.json`
- `packages/create-tree-id/tsconfig.json`
- `packages/create-tree-id/tsup.config.ts`
- `packages/create-tree-id/bin/cli.js`
- `packages/create-tree-id/src/index.ts`
- `packages/create-tree-id/src/supabase-api.ts`
- `packages/create-tree-id/src/cloudflare-api.ts`
- `packages/create-tree-id/src/env-writer.ts`
- `packages/create-tree-id/src/migrations-runner.ts`

## Implementation Steps

1. **Create `packages/create-tree-id/package.json`:**
   ```json
   {
     "name": "create-tree-id",
     "version": "0.1.0",
     "bin": { "create-tree-id": "./bin/cli.js" },
     "type": "module",
     "scripts": {
       "build": "tsup",
       "dev": "tsup --watch",
       "prepublishOnly": "npm run build"
     },
     "dependencies": {
       "@clack/prompts": "^0.7.0"
     },
     "devDependencies": {
       "tsup": "^8.0.0",
       "typescript": "^5.3.0"
     },
     "engines": { "node": ">=18.0.0" }
   }
   ```

2. **Create `bin/cli.js`:**
   ```javascript
   #!/usr/bin/env node
   import('../dist/index.mjs').then(m => m.main())
   ```

3. **Create `src/supabase-api.ts`:**
   - `getOrganizations(token)` — `GET /v1/organizations`
   - `createProject(token, orgId, name, dbPass, region)` — `POST /v1/projects`
   - `waitForActive(token, projectId)` — poll `GET /v1/projects/{id}` every 2s, max 60 attempts
   - Return `{ host, port, dbUrl, anonKey, serviceRoleKey }`

4. **Create `src/cloudflare-api.ts`:**
   - `createBucket(token, accountId, bucketName)` — `POST /accounts/{id}/r2/buckets`
   - `setCors(token, accountId, bucketName, origin)` — `PUT .../cors`
   - Return `{ bucket, endpoint, accessKeyId, secretAccessKey }` (note: R2 API tokens for S3 compat are separate from CF API token — prompt for both or document manual step)

5. **Create `src/env-writer.ts`:**
   - Accept env vars object
   - Check if `.env.local` exists → backup to `.env.local.backup`
   - Write env file with section comments
   - `chmod 600` on non-Windows

6. **Create `src/migrations-runner.ts`:**
   - `spawn('npx', ['payload', 'migrate'], { cwd, env, stdio: 'inherit' })`
   - Wrap in Promise with 60s timeout
   - Handle exit code

7. **Create `src/index.ts` — main flow:**
   - `intro()` welcome message
   - Collect site name via `text()`
   - Prompt for Supabase token via `password()`, skip if empty
   - If Supabase token: run supabase-api flow with `spinner()`
   - Prompt for CF account ID + API token, skip if empty
   - If CF token: run cloudflare-api flow with `spinner()`
   - Call env-writer with collected credentials
   - Run `npm install` via spawn
   - Run migrations-runner
   - `outro()` with success + `npm run dev` command

8. **Create `tsup.config.ts`:**
   ```typescript
   import { defineConfig } from 'tsup'
   export default defineConfig({
     entry: ['src/index.ts'],
     format: ['esm'],
     target: 'node18',
     clean: true,
   })
   ```

9. **Test locally:**
   ```bash
   cd packages/create-tree-id
   npm install && npm run build
   npm link
   create-tree-id test-project
   ```

## Todo List

- [x] Create `packages/create-tree-id/package.json`
- [x] Create `packages/create-tree-id/tsconfig.json`
- [x] Create `packages/create-tree-id/tsup.config.ts`
- [x] Create `packages/create-tree-id/bin/cli.js`
- [x] Create `packages/create-tree-id/src/index.ts`
- [x] Create `packages/create-tree-id/src/supabase-api.ts`
- [x] Create `packages/create-tree-id/src/cloudflare-api.ts`
- [x] Create `packages/create-tree-id/src/env-writer.ts`
- [x] Create `packages/create-tree-id/src/migrations-runner.ts`
- [x] Build + verified via `npm install && npm run build` (17.82 KB ESM output)
- [ ] Test skip-all-tokens fallback path (requires interactive TTY)
- [ ] Test full provisioning path (requires real tokens)

## Success Criteria
- `npx create-tree-id my-site` runs end-to-end
- Supabase project created + active when token provided
- R2 bucket created + CORS configured when token provided
- `.env.local` generated with correct values
- Skipping tokens prints clear manual setup instructions
- Ctrl+C exits cleanly at any prompt

## Risk Assessment
- **R2 API token vs S3 credentials:** CF API token (for bucket creation) differs from R2 S3-compatible credentials (for uploads). CLI must document that user needs to create R2 API token separately in CF dashboard for `R2_ACCESS_KEY_ID`/`R2_SECRET_ACCESS_KEY`
- **Supabase rate limits:** Project creation may be rate-limited; handle 429 responses
- **Windows chmod:** `fs.chmod(path, 0o600)` behaves differently on Windows; skip on win32

## Security Considerations
- Never log API tokens to console
- `.env.local` permissions restricted (0o600 on Unix)
- Tokens collected via `password()` prompt (hidden input)
- No tokens stored in CLI config/cache

## Next Steps
- Phase 7 adds README documentation for CLI usage
- Publish to npm when MVP is stable
