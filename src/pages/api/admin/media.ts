/**
 * Admin media API — list and delete files from R2
 * GET  /api/admin/media?prefix=media/shared/  — list R2 objects
 * DELETE /api/admin/media                     — delete R2 object by key
 */
import type { APIRoute } from 'astro'
import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { checkFeatureEnabled } from '@/lib/admin/feature-guard'
import { json } from '@/lib/api-response'

export const prerender = false


function buildR2Client() {
  const endpoint = process.env.R2_ENDPOINT
  if (!endpoint) return null
  return new S3Client({
    region: process.env.R2_REGION || 'auto',
    endpoint: `https://${endpoint}`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  })
}

/** GET — list media files from R2 */
export const GET: APIRoute = async ({ url }) => {
  const fc = await checkFeatureEnabled('media')
  if (!fc.enabled) return fc.response
  const bucket = process.env.R2_BUCKET
  const publicUrl = process.env.R2_PUBLIC_URL
  const client = buildR2Client()

  if (!bucket || !publicUrl || !client) {
    return json({ ok: true, data: { items: [], configured: false } })
  }

  try {
    const prefix = url.searchParams.get('prefix') || 'media/'
    const token = url.searchParams.get('cursor') || undefined

    const result = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        MaxKeys: 200,
        ContinuationToken: token,
      }),
    )

    const items = (result.Contents || []).map((obj) => ({
      key: obj.Key!,
      url: `${publicUrl}/${obj.Key}`,
      size: obj.Size || 0,
      lastModified: obj.LastModified?.toISOString() || null,
    }))

    return json({
      ok: true,
      data: {
        items,
        configured: true,
        hasMore: result.IsTruncated || false,
        nextCursor: result.NextContinuationToken || null,
      },
    })
  } catch {
    return json({ ok: false, error: 'Failed to list media' }, 500)
  }
}

/** DELETE — remove a file from R2 */
export const DELETE: APIRoute = async ({ request }) => {
  const fc = await checkFeatureEnabled('media')
  if (!fc.enabled) return fc.response
  const bucket = process.env.R2_BUCKET
  const client = buildR2Client()

  if (!bucket || !client) {
    return json({ ok: false, error: 'R2 not configured' }, 503)
  }

  try {
    const { key: rawKey } = (await request.json()) as { key: string }
    const key = (rawKey || '').replace(/\/+/g, '/')
    if (!key || !key.startsWith('media/') || key.includes('..')) {
      return json({ ok: false, error: 'Invalid key' }, 400)
    }

    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
    return json({ ok: true })
  } catch {
    return json({ ok: false, error: 'Delete failed' }, 500)
  }
}
