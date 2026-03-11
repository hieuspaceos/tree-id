/**
 * Admin distribution API — serves marketing stats and content inventory
 * GET /api/admin/distribution — returns stats, inventory, recent entries
 */
import type { APIRoute } from 'astro'
import { getAllPublishedSeeds } from '@/lib/content-helpers'
import {
  parseDistributionLog,
  getDistributionStats,
  buildContentInventory,
} from '@/lib/distribution-helpers'

export const prerender = false

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const GET: APIRoute = async () => {
  try {
    const entries = parseDistributionLog()
    const stats = getDistributionStats(entries)
    const seeds = await getAllPublishedSeeds()
    const inventory = buildContentInventory(seeds, entries)
    const recentEntries = entries.slice(-10).reverse()

    return json({
      ok: true,
      data: { stats, inventory, recentEntries },
    })
  } catch (err) {
    return json({ ok: false, error: 'Failed to load distribution data' }, 500)
  }
}
