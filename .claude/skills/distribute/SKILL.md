# Distribute - Content Distribution

Generate social media posts from Tree Identity articles and notes.

## Trigger
- `/distribute <slug>` — generate social posts for a specific article/note
- `/distribute --latest` — auto-detect and distribute the most recent content
- `/distribute --mark-posted --slug <slug>` — mark a distributed slug as posted in the log

## Usage

```
/distribute welcome-to-tree-id
/distribute --latest
/distribute --mark-posted --slug welcome-to-tree-id
```

## What It Does

1. Reads article/note markdown from `src/content/`
2. Calls Gemini Flash API (free) with brand voice rules
3. Outputs formatted Twitter thread + LinkedIn post
4. Auto-logs the run to `logs/distribution-log.csv`

## Implementation

Run the distribution script using the skills venv Python:

**Windows:**
```bash
.claude\skills\.venv\Scripts\python.exe scripts/distribute-content.py --slug <slug>
```

**Linux/macOS:**
```bash
.claude/skills/.venv/bin/python3 scripts/distribute-content.py --slug <slug>
```

For `--latest`:
```bash
.claude\skills\.venv\Scripts\python.exe scripts/distribute-content.py --latest
```

For `--mark-posted`:
```bash
.claude\skills\.venv\Scripts\python.exe scripts/distribute-content.py --slug <slug> --mark-posted
```

## Requirements
- `GEMINI_API_KEY` environment variable set (free from https://aistudio.google.com/apikey)
- `google-genai` package installed in skills venv

## Brand Voice
Rules defined in `.claude/rules/content-distribution.md`. The script uses these as the Gemini system prompt.

## Output
Copy-paste ready social posts in this format:
```
=== TWITTER THREAD ===
[1/N] <tweet>
[2/N] <tweet>
[N/N] <link>

=== LINKEDIN ===
<post text>
<link>
```
