/**
 * Postiz API client — schedule social posts via Postiz platform
 * Supports both cloud (api.postiz.com) and self-hosted instances
 * Requires POSTIZ_API_KEY and optionally POSTIZ_API_URL env vars
 */

export interface PostizIntegration {
  id: string
  name: string
  identifier: string
  picture?: string
  disabled: boolean
  profile?: string
}

export interface PostizScheduleResult {
  postId: string
  integration: string
}

/** Map our platform names to Postiz __type identifiers */
const PLATFORM_TYPE_MAP: Record<string, string> = {
  'Twitter/X': 'x',
  'LinkedIn': 'linkedin',
  'Facebook': 'facebook',
  'Reddit': 'reddit',
  'Threads': 'threads',
  'Hacker News': '', // Not supported by Postiz
  'Dev.to': 'devto',
  'Hashnode': 'hashnode',
  'Medium': 'medium',
  'Viblo': '', // Not supported by Postiz
  'Substack': '', // Not supported by Postiz
}

/** Map Postiz identifier to our platform names */
const IDENTIFIER_TO_PLATFORM: Record<string, string> = {
  'x': 'Twitter/X',
  'linkedin': 'LinkedIn',
  'linkedin-page': 'LinkedIn',
  'facebook': 'Facebook',
  'reddit': 'Reddit',
  'threads': 'Threads',
  'devto': 'Dev.to',
  'hashnode': 'Hashnode',
  'medium': 'Medium',
}

function getConfig() {
  const apiKey = import.meta.env.POSTIZ_API_KEY || process.env.POSTIZ_API_KEY
  const apiUrl = import.meta.env.POSTIZ_API_URL || process.env.POSTIZ_API_URL
    || 'https://api.postiz.com/public/v1'
  return { apiKey, apiUrl }
}

/** Check if Postiz is configured */
export function isPostizConfigured(): boolean {
  return !!getConfig().apiKey
}

/** Fetch connected integrations from Postiz */
export async function getConnectedPlatforms(): Promise<PostizIntegration[]> {
  const { apiKey, apiUrl } = getConfig()
  if (!apiKey) return []

  const res = await fetch(`${apiUrl}/integrations`, {
    headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
  })

  if (!res.ok) {
    throw new Error(`Postiz API error: ${res.status} ${res.statusText}`)
  }

  const integrations = (await res.json()) as PostizIntegration[]
  return integrations.filter((i) => !i.disabled)
}

/** Get platform names mapped to their Postiz integration IDs */
export async function getConnectedPlatformMap(): Promise<Record<string, string>> {
  const integrations = await getConnectedPlatforms()
  const map: Record<string, string> = {}
  for (const integration of integrations) {
    const name = IDENTIFIER_TO_PLATFORM[integration.identifier]
    if (name && !map[name]) map[name] = integration.id
  }
  return map
}

/** Build platform-specific settings for Postiz post */
function buildSettings(platform: string, content: string): Record<string, unknown> {
  const type = PLATFORM_TYPE_MAP[platform]
  const base: Record<string, unknown> = { __type: type }

  switch (type) {
    case 'x':
      base.who_can_reply_post = 'everyone'
      break
    case 'medium':
      // Extract first line as title
      base.title = content.split('\n')[0].slice(0, 100)
      base.subtitle = ''
      break
    case 'devto':
      base.title = content.split('\n')[0].slice(0, 100)
      break
    case 'hashnode':
      base.title = content.split('\n')[0].slice(0, 100)
      base.tags = []
      break
  }

  return base
}

/** Schedule a post to a specific platform via Postiz */
export async function schedulePost(
  platform: string,
  content: string,
  integrationId: string,
  scheduledAt?: string,
): Promise<PostizScheduleResult> {
  const { apiKey, apiUrl } = getConfig()
  if (!apiKey) {
    throw new Error('POSTIZ_API_KEY not configured')
  }

  const type = PLATFORM_TYPE_MAP[platform]
  if (!type) {
    throw new Error(`Platform "${platform}" is not supported by Postiz`)
  }

  const body = {
    type: scheduledAt ? 'schedule' : 'now',
    date: scheduledAt || new Date().toISOString(),
    shortLink: false,
    tags: [],
    posts: [
      {
        integration: { id: integrationId },
        value: [{ content, image: [] }],
        settings: buildSettings(platform, content),
      },
    ],
  }

  const res = await fetch(`${apiUrl}/posts`, {
    method: 'POST',
    headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Postiz schedule failed: ${res.status} — ${text}`)
  }

  const result = (await res.json()) as PostizScheduleResult[]
  return result[0] || { postId: 'unknown', integration: integrationId }
}
