# AI Clone — Auto-Improve (Session tiếp)

**Goal**: Clone tự retry missing sections, validate output, extract design chính xác
**Status**: Pending
**Depends on**: Current stable (`93543a3`)

## Phase 1: Auto-retry missing sections
- After clone, detect missing H2 headings
- Auto-call Gemini lần 2 CHỈ cho sections thiếu (prompt nhỏ, targetted)
- Merge vào result → user nhận full sections
- Không ảnh hưởng Tier 1 (chỉ retry khi có missing)
**Files**: `landing-clone-ai.ts`

## Phase 2: Post-clone validation + auto-fix
- Check mỗi section: có heading? có items? có image (nếu hero/image-text)?
- Sections empty → auto-retry fill cho section đó
- Show quality score per section trong wizard (green/yellow/red)
**Files**: `landing-clone-ai.ts`, `landing-clone-modal.tsx`

## Phase 3: Design extraction (separate call)
- 1 Gemini call nhỏ chỉ extract: colors, fonts, borderRadius
- Dùng CSS từ HTML (không dùng Markdown)
- Merge vào result.design
- Cost: ~$0.0005 thêm
**Files**: `landing-clone-ai.ts`

## Phase 4: Backlog → auto-suggest sections to add
- Wizard review: button "Add missing sections"
- Click → tạo empty sections với heading pre-filled từ missing list
- User chỉ cần edit content, không cần tạo section manually
**Files**: `landing-clone-modal.tsx`, `landing-page-editor.tsx`

## Safety
- Test claudekit.cc after every phase
- Tier 1 path unchanged
- Auto-retry = additive only (never removes existing sections)
