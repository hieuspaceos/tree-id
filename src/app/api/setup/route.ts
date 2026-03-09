import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * One-time setup endpoint that creates all DB tables.
 * DELETE THIS FILE after setup succeeds.
 */
export const maxDuration = 60

export async function GET() {
  try {
    const payload = await getPayload({ config })

    // Attempt schema push via drizzle adapter internals
    const db = payload.db as unknown as Record<string, unknown>
    const availableMethods = Object.keys(db).filter(
      (k) => typeof db[k] === 'function',
    )

    // Try known Payload DB adapter methods for schema creation
    if (typeof db.push === 'function') {
      await (db.push as () => Promise<void>)()
    } else if (typeof db.migrate === 'function') {
      await (db.migrate as () => Promise<void>)()
    }

    // Verify tables exist
    const users = await payload.find({ collection: 'users', limit: 1 })

    return NextResponse.json({
      success: true,
      message: 'Database tables created successfully',
      usersCount: users.totalDocs,
    })
  } catch (error) {
    // Return diagnostic info to debug
    const payload = await getPayload({ config }).catch(() => null)
    const dbMethods = payload
      ? Object.keys(payload.db).filter(
          (k) => typeof (payload.db as unknown as Record<string, unknown>)[k] === 'function',
        )
      : []

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to initialize database',
        error: error instanceof Error ? error.message : String(error),
        dbMethods,
      },
      { status: 500 },
    )
  }
}
