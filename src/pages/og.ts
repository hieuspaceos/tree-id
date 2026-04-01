import type { APIRoute } from 'astro'
import satori from 'satori'
import { siteConfig } from '@/config/site-config'
import { getTheme } from '@/themes/theme-resolver'

// Must be SSR — image generation is dynamic per request
export const prerender = false

// Track whether resvg-wasm has been initialised for this isolate lifetime
let wasmReady = false

export const GET: APIRoute = async ({ request }) => {
  const theme = getTheme(siteConfig.theme.id)
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title')?.slice(0, 100) || siteConfig.name
  const desc = searchParams.get('desc')?.slice(0, 200) || siteConfig.description

  // Build satori element tree (same visual as the former @vercel/og version)
  const element = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column' as const,
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
          type: 'h1',
          props: {
            style: { fontSize: 60, margin: 0, lineHeight: 1.1 },
            children: title,
          },
        },
        {
          type: 'p',
          props: {
            style: { fontSize: 28, opacity: 0.8, marginTop: 16 },
            children: desc,
          },
        },
        {
          type: 'p',
          props: {
            style: { fontSize: 20, opacity: 0.5, marginTop: 'auto' },
            children: siteConfig.name,
          },
        },
      ],
    },
  }

  try {
    // Generate SVG via satori (fonts array required; empty = satori uses built-in fallback)
    const svg = await satori(element as Parameters<typeof satori>[0], {
      width: 1200,
      height: 630,
      fonts: [],
    })

    // Convert SVG → PNG using @resvg/resvg-wasm
    const { Resvg, initWasm } = await import('@resvg/resvg-wasm')

    if (!wasmReady) {
      // Fetch the wasm binary from the package URL — works in both Node and CF Workers
      const wasmUrl = new URL(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore — package exports wasm via this path
        '../../../node_modules/@resvg/resvg-wasm/index_bg.wasm',
        import.meta.url
      )
      const wasmBinary = await fetch(wasmUrl).then((r) => r.arrayBuffer())
      await initWasm(wasmBinary)
      wasmReady = true
    }

    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
    const pngData = resvg.render()
    // asPng() returns Uint8Array — cast to satisfy Response BodyInit type
    const png = pngData.asPng() as unknown as Uint8Array

    return new Response(png as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    })
  } catch (err) {
    console.error('[og.ts] image generation failed:', err)
    return new Response('Failed to generate OG image', { status: 500 })
  }
}
