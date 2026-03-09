import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * One-time setup endpoint that creates all DB tables.
 * Calls migrateFresh which drops and recreates the schema.
 * DELETE THIS FILE after setup succeeds.
 */
export const maxDuration = 60

export async function GET(request: Request) {
  const url = new URL(request.url)
  const method = url.searchParams.get('method') || 'fresh'

  try {
    const payload = await getPayload({ config })

    if (method === 'fresh') {
      // migrateFresh drops all tables and re-runs migrations
      await payload.db.migrateFresh({ forceAcceptWarning: true })
    } else if (method === 'migrate') {
      await payload.db.migrate()
    }

    // Verify tables exist
    const users = await payload.find({ collection: 'users', limit: 1 })

    return NextResponse.json({
      success: true,
      message: `Database setup complete via ${method}`,
      usersCount: users.totalDocs,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        method,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined,
      },
      { status: 500 },
    )
  }
}
