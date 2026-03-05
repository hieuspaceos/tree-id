import type { CollectionBeforeValidateHook } from 'payload'

export const autoSlug: CollectionBeforeValidateHook = ({ data, operation }) => {
  if (operation === 'create' && data?.title && !data?.slug) {
    data.slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
  return data
}