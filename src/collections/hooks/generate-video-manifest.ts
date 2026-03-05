import type { CollectionAfterChangeHook } from 'payload'
import { uploadManifest } from '@/lib/r2/upload-manifest'

export const generateVideoManifest: CollectionAfterChangeHook = async ({ doc, collection }) => {
  // Only fire when published + video enabled
  if (doc.status !== 'published' || !doc.video?.enabled) return doc

  try {
    const manifest = {
      slug: doc.slug,
      title: doc.title,
      type: collection.slug, // 'articles' or 'notes'
      style: doc.video.style || null,
      sections: (doc.video.sections || []).map((s: any) => ({
        id: s.sectionId,
        timestamp: s.timestamp || null,
        narration: s.narration || null,
        bRollQuery: s.bRollQuery || null,
        onScreenText: s.onScreenText || null,
        mediaRefs: (s.mediaRefs || []).map((r: any) => r.ref),
      })),
      cover: doc.cover ? { url: doc.cover.url, alt: doc.cover.alt } : null,
      publishedAt: doc.publishedAt,
      treeIdentityVersion: '1.0',
    }

    await uploadManifest(doc.slug, manifest)
    console.log(`[video-manifest] Uploaded manifests/${doc.slug}.json`)
  } catch (error) {
    // Log error but do NOT fail the save, as per Phase 6 requirement
    console.error(`[video-manifest] Failed to upload manifest for ${doc.slug}:`, error)
  }

  return doc
}