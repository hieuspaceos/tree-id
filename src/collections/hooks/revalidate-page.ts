import type { CollectionAfterChangeHook } from 'payload'
import { revalidatePath } from 'next/cache'

export const revalidatePage: CollectionAfterChangeHook = ({ doc }) => {
  if (doc.status === 'published') {
    revalidatePath(`/seeds/${doc.slug}`)
    revalidatePath('/')
  }
  return doc
}