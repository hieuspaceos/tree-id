# AI Clone — Auto-Improve (Session tiếp)

**Goal**: Clone tự retry missing sections, validate output, extract design chính xác
**Status**: Complete
**Depends on**: Current stable (`93543a3`)
**Completed**: 2026-03-29

## Phase 1: Auto-retry missing sections ✓ COMPLETE
- After clone, detect missing H2 headings
- Auto-call Gemini lần 2 CHỈ cho sections thiếu (prompt nhỏ, targetted)
- Merge vào result → user nhận full sections
- Không ảnh hưởng Tier 1 (chỉ retry khi có missing)
**Status**: Implemented
**Implementation**: retryMissingSections() in landing-clone-ai.ts, calls Gemini for missed H2s, merges additive-only
**Files**: `landing-clone-ai.ts`

## Phase 2: Post-clone validation + auto-fix ✓ COMPLETE
- Check mỗi section: có heading? có items? có image (nếu hero/image-text)?
- Sections empty → auto-retry fill cho section đó
- Show quality score per section trong wizard (green/yellow/red)
**Status**: Implemented
**Implementation**: assessSectionQuality() + quality dots (●/◐/○) in wizard modal
**Files**: `landing-clone-ai.ts`, `landing-clone-modal.tsx`

## Phase 3: Design extraction (separate call) ✓ COMPLETE
- 1 Gemini call nhỏ chỉ extract: colors, fonts, borderRadius
- Dùng CSS từ HTML (không dùng Markdown)
- Merge vào result.design
- Cost: ~$0.0005 thêm
**Status**: Implemented
**Implementation**: separate extractDesign() Gemini call using HTML/CSS, merges with clone design
**Files**: `landing-clone-ai.ts`

## Phase 4: Backlog → auto-suggest sections to add ✓ COMPLETE
- Wizard review: button "Add missing sections"
- Click → tạo empty sections với heading pre-filled từ missing list
- User chỉ cần edit content, không cần tạo section manually
**Status**: Implemented
**Implementation**: creates rich-text placeholders from missing headings in wizard
**Files**: `landing-clone-modal.tsx`, `landing-page-editor.tsx`

## Phase 5: Layout section usage in clone ✓ COMPLETE
- Gemini không dùng layout section vì prompt không hướng dẫn khi nào dùng
- Thêm instruction: "When original page has multi-column sections (e.g. 2 content blocks side-by-side), use layout section with nested sections in columns"
- Teach Gemini layout structure: `{columns:[1,1], children:[{column:0, sections:[...]}, {column:1, sections:[...]}]}`
- Map common patterns: stats+testimonials side-by-side, image+form combo, multi-card grids
**Status**: Implemented
**Implementation**: added LAYOUT instruction to DIRECT_CLONE_PROMPT, STRUCTURE_PROMPT, RETRY_MISSING_PROMPT
**Files**: `landing-clone-ai.ts` (prompt update)

## Additional Work Completed
- **Modularization**: extracted shared utils to clone-ai-utils.ts (172 lines)
- **Bug fix**: testimonials normalization (d.reviews was destroyed before assignment)
- **Bug fix**: retry order assignment (each section gets distinct order)
- **Fix**: circular type import resolved (CloneResult moved to clone-ai-utils.ts)

## Safety
- Test claudekit.cc after every phase
- Tier 1 path unchanged
- Auto-retry = additive only (never removes existing sections)
- All tests pass with new functionality
