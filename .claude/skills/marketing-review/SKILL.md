# Marketing Review - Monthly AI Analysis

Analyze distribution data and platform metrics to produce actionable monthly insights.

## Trigger
- `/marketing-review` — run monthly marketing analysis

## Usage

```
/marketing-review
```

## What It Does

1. Reads `logs/distribution-log.csv` — frequency, consistency, platform usage
2. Reads `docs/marketing-metrics.md` — platform performance numbers
3. Reads `.claude/rules/content-distribution.md` — current brand voice rules
4. Analyzes trends and produces a monthly review section
5. Appends the review to `docs/marketing-metrics.md`

## Instructions

When triggered, perform these steps:

1. Read all three data sources listed above
2. Analyze the data for the current month (or most recent month with data)
3. Generate a monthly review section with:
   - **Summary**: distribution count, frequency, platform split
   - **What Worked**: top-performing content/formats based on metrics
   - **What Didn't**: underperforming areas or gaps
   - **Rule Updates Suggested**: specific changes to brand voice rules (as checkboxes)
   - **Action Items for Next Month**: 3-5 specific, actionable items
4. Append the review section to `docs/marketing-metrics.md`
5. Present the review to the user for approval before saving

## Output Format

```markdown
## Monthly Review — YYYY-MM

### Summary
- Distributed X articles across Y platforms
- Avg Z posts/week (target: N)

### What Worked
- (data-driven observations)

### What Didn't
- (gaps, underperformance)

### Rule Updates Suggested
- [ ] (specific rule change based on data)

### Action Items for Next Month
1. (specific action)
2. (specific action)
3. (specific action)
```

## Requirements
- At least 2 weeks of distribution log data
- Platform metrics manually entered in `docs/marketing-metrics.md`
- Runs inside Claude Code session (no API cost beyond subscription)
