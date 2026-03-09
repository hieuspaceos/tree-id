import type { CollectionConfig } from 'payload'
import { baseSeedFields } from './fields/base-seed-fields.js'
import { autoSlug } from './hooks/auto-slug.js'
import { setPublishedAt } from './hooks/set-published-at.js'
import { revalidatePage } from './hooks/revalidate-page.js'
import { generateVideoManifest } from './hooks/generate-video-manifest.js'

export const Notes: CollectionConfig = {
  slug: 'notes',
  admin: { useAsTitle: 'title' },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    ...baseSeedFields,
    { name: 'content', type: 'textarea' },
  ],
  hooks: {
    beforeValidate: [autoSlug],
    beforeChange: [setPublishedAt],
    afterChange: [revalidatePage, generateVideoManifest],
  },
}
