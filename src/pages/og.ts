import type { APIRoute } from 'astro'
import { ImageResponse } from '@vercel/og'
import { siteConfig } from '@/config/site-config'
import { getTheme } from '@/themes/theme-resolver'

// Must be SSR — image generation is dynamic per request
export const prerender = false

export const GET: APIRoute = async ({ request }) => {
  const theme = getTheme(siteConfig.theme.id)
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title')?.slice(0, 100) || siteConfig.name
  const desc = searchParams.get('desc')?.slice(0, 200) || siteConfig.description

  // Use object syntax (not JSX) — @vercel/og requires ReactElement shape with key field
  const element = {
    key: null,
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        padding: '48px',
        background: theme.accent,
        color: 'white',
        fontFamily: 'sans-serif',
      },
      children: [
        {
          key: null,
          type: 'h1',
          props: {
            style: { fontSize: 60, margin: 0, lineHeight: 1.1 },
            children: title,
          },
        },
        {
          key: null,
          type: 'p',
          props: {
            style: { fontSize: 28, opacity: 0.8, marginTop: 16 },
            children: desc,
          },
        },
        {
          key: null,
          type: 'p',
          props: {
            style: { fontSize: 20, opacity: 0.5, marginTop: 'auto' },
            children: siteConfig.name,
          },
        },
      ],
    },
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new ImageResponse(element as any, { width: 1200, height: 630 }) as unknown as Response
}
