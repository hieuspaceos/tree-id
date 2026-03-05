import type { Field } from 'payload'

export const baseSeedFields: Field[] = [
  { name: 'title', type: 'text', required: true },
  { name: 'description', type: 'textarea', required: true },
  {
    name: 'slug', type: 'text', required: true, unique: true,
    admin: { readOnly: true, position: 'sidebar' },
  },
  {
    name: 'status', type: 'select',
    options: [
      { label: 'Draft', value: 'draft' },
      { label: 'Published', value: 'published' },
    ],
    defaultValue: 'draft', required: true,
  },
  { name: 'publishedAt', type: 'date', admin: { readOnly: true, position: 'sidebar' } },
  {
    name: 'tags', type: 'array',
    fields: [{ name: 'tag', type: 'text', required: true }],
  },
  { name: 'category', type: 'text' },
  // SEO group
  {
    name: 'seo', type: 'group',
    fields: [
      { name: 'seoTitle', type: 'text' },
      { name: 'ogImage', type: 'text' },
      { name: 'noindex', type: 'checkbox', defaultValue: false },
    ],
  },
  // Cover image
  {
    name: 'cover', type: 'group',
    fields: [
      { name: 'url', type: 'text' },
      { name: 'alt', type: 'text' },
    ],
  },
  // Video-factory contract (LOCKED)
  {
    name: 'video', type: 'group',
    fields: [
      { name: 'enabled', type: 'checkbox', defaultValue: false },
      {
        name: 'style', type: 'select',
        options: [
          { label: 'Cinematic', value: 'cinematic' },
          { label: 'Tutorial', value: 'tutorial' },
          { label: 'Vlog', value: 'vlog' },
        ],
      },
      {
        name: 'sections', type: 'array',
        fields: [
          { name: 'sectionId', type: 'text', required: true },
          { name: 'timestamp', type: 'text' },
          { name: 'narration', type: 'textarea' },
          { name: 'bRollQuery', type: 'text' },
          { name: 'onScreenText', type: 'text' },
          {
            name: 'mediaRefs', type: 'array',
            fields: [{ name: 'ref', type: 'text' }],
          },
        ],
      },
    ],
  },
  // Zettelkasten links (Phase 2 activation, define now)
  {
    name: 'links', type: 'group',
    fields: [
      {
        name: 'outbound', type: 'array',
        fields: [{ name: 'slug', type: 'text' }],
      },
    ],
  },
]