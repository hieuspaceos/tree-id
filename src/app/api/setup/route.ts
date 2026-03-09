import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * One-time setup endpoint. With drizzle-kit now a direct dep,
 * Payload's push:true should work. This endpoint just initializes
 * Payload and verifies tables exist.
 * DELETE THIS FILE after setup succeeds.
 */
export const maxDuration = 60

export async function GET() {
  try {
    const payload = await getPayload({ config })

    // Verify tables exist by querying users
    const users = await payload.find({ collection: 'users', limit: 1 })

    return NextResponse.json({
      success: true,
      message: 'Database tables exist and are accessible',
      usersCount: users.totalDocs,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
