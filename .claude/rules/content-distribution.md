# Content Distribution Rules

Rules for generating social media posts from Tree Identity content.
Used by Claude Code, Gemini Flash, or any model in the distribution pipeline.

## Brand Voice

- Tone: thoughtful, concise, authentic — like a developer sharing what they learned
- No corporate speak, no hype words ("revolutionary", "game-changing", "unleash")
- No emojis unless the original article uses them
- Write as first person ("I built...", "I learned...", "Here's what I found...")
- Prefer short sentences. Cut filler words.
- Vietnamese articles → Vietnamese social posts. English → English.

## Platform Formats

### Twitter/X Thread
- First tweet: hook + key insight (max 260 chars to leave room for link)
- Thread: 2-4 tweets max, each adds a distinct point
- Last tweet: link to article + one-line CTA
- No hashtags unless highly relevant (max 2)
- Format: plain text, no markdown

### LinkedIn Post
- Max 1500 chars (short-form performs better)
- Opening line: bold statement or question (hook)
- Body: 3-5 short paragraphs, single key takeaway each
- End with article link
- No hashtag spam (max 3 relevant ones)

## Content Extraction Rules
- Read the full article/note markdown
- Identify: main thesis, 2-3 supporting points, conclusion
- Do NOT summarize everything — pick the most interesting angle
- If article has code: mention the tech but don't paste code in social posts
- If article is a note (short-form): one tweet + LinkedIn short post is enough

## UTM Parameters
- Always append UTM to article links in social posts
- Format: `?utm_source={platform}&utm_medium=social&utm_campaign=distribute`
- Platforms: `twitter`, `linkedin`, `reddit`

## Output Format
When generating posts, output in this exact format:

```
=== TWITTER THREAD ===

[1/N] <tweet text>

[2/N] <tweet text>

[N/N] <link with UTM>

=== LINKEDIN ===

<post text>

<link with UTM>
```

## Quality Checklist
Before outputting, verify:
- [ ] Character limits respected
- [ ] Link included with correct UTM
- [ ] Matches original article language (EN/VI)
- [ ] No hallucinated claims not in the article
- [ ] Tone matches brand voice above

## Distribution Tool: Postiz

**Postiz** — open-source social media scheduler for publishing generated posts.
- Self-host (Docker) or SaaS: https://postiz.com
- GitHub: https://github.com/gitroomhq/postiz-app
- 13+ platforms: X, LinkedIn, Instagram, YouTube, TikTok, Facebook, Discord, Pinterest, Threads, Reddit, Dribbble, Mastodon, Bluesky
- API + NodeJS SDK for automation (N8N, Make, Zapier)
- OAuth-based, no scraping

### Pipeline
```
Tree-ID article
  → Claude Code generates social posts (this file's rules)
  → Postiz API schedules & publishes to platforms
```

### Setup (separate project)
1. Self-host via Docker or use Postiz cloud
2. Connect social accounts via OAuth
3. Use API/SDK to push generated posts from Claude Code session
- Status: Backlog (Phases 2-3 of Content Distribution workflow)
