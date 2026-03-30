/**
 * Field-level help text for non-obvious fields in the landing page editor.
 * Used by HelpTip component next to field labels.
 * Keys are "sectionType.fieldName" or generic field names.
 */

/** Field-level help text for non-obvious fields */
export const FIELD_HELP: Record<string, string> = {
  'hero.headline': 'The main text visitors see first. Keep it short and compelling — under 10 words.',
  'hero.subheadline': 'A supporting line that explains your headline in more detail. 1-2 sentences.',
  'hero.backgroundImage': 'Full-width image behind your text. Use a dark image so white text stays readable.',
  'hero.embed': 'A video URL (YouTube embed, Vimeo, or .mp4) shown alongside or behind your headline.',
  'features.columns': 'How many feature cards appear per row. 3 works best for most screens.',
  'pricing.highlighted': 'The featured plan gets a colored border and badge to draw attention. Usually your recommended plan.',
  'layout.gap': 'Space between columns. Use "1rem" for normal spacing, "2rem" for wide gaps.',
  'layout.columns': 'Column width ratios. 1:1 = equal halves. 1:2 = narrow + wide column.',
  'nav.links': 'If left empty, links are auto-generated from your page sections.',
  'nav.logo': 'Your brand logo image. Leave empty to show text brand name instead.',
  'cta.backgroundImage': 'Background image behind the action area. Dark images work best with light text.',
  'gallery.columns': 'Photos per row. More columns = smaller thumbnails. 3-4 works best.',
  'divider.height': 'Vertical space in pixels. 40px is normal, 80px adds more breathing room between sections.',
  'contact-form.submitUrl': 'Where form data gets sent. Leave empty to use the default handler.',
  'banner.dismissible': 'Shows an × button so visitors can close the banner.',
  'comparison.highlight': 'Highlighted rows get a colored background to stand out in the table.',
  'image.alt': 'Description of the image for screen readers and SEO. Describe what is in the image.',
  'stats.variant.counter': 'Numbers animate from 0 when scrolled into view — great for impressions.',
}

/** Section type descriptions shown in the picker and on hover */
export const SECTION_TYPE_HELP: Record<string, string> = {
  nav: 'Navigation bar that sticks to the top of the page with your brand name and links.',
  hero: 'The first thing visitors see — a large banner with your headline and action button.',
  features: 'Show what your product or service offers using cards with icons and descriptions.',
  pricing: 'Display your pricing plans side by side so visitors can compare and choose.',
  testimonials: 'Show what your customers are saying — quotes, names, and photos.',
  faq: 'Answer common questions. Visitors can expand each item to read the answer.',
  cta: 'A bold section that encourages visitors to take action — sign up, buy, or contact you.',
  stats: 'Display impressive numbers like users, revenue, uptime, countries served, etc.',
  'how-it-works': 'Walk visitors through your process step by step with numbers or icons.',
  team: 'Introduce your team members with photos, roles, and short bios.',
  'logo-wall': 'Show logos of partners, clients, or media outlets that featured you.',
  footer: 'Bottom of the page with links, copyright notice, and social media icons.',
  video: 'Embed a YouTube or Vimeo video directly in your page.',
  image: 'A single image, optionally full-width with a caption below.',
  'image-text': 'An image on one side and text on the other — great for storytelling.',
  gallery: 'A grid of photos that visitors can click to enlarge.',
  map: 'Embed a Google Map showing your location or office address.',
  'rich-text': 'Write anything in Markdown — articles, policies, or custom formatted content.',
  divider: 'A visual separator between sections — a line, dots, or empty space.',
  countdown: 'A ticking countdown to a deadline — great for launches and limited offers.',
  'contact-form': 'A form where visitors can send you a message directly from the page.',
  banner: 'An announcement bar at the top — for sales, news, warnings, or promotions.',
  comparison: 'Compare features side by side in a table format, e.g. you vs competitors.',
  'ai-search': 'A smart search box that suggests products or services based on what visitors type.',
  'social-proof': 'A short trust line like "Trusted by 100+ businesses" — builds credibility.',
  layout: 'Create multi-column layouts and nest other sections inside each column.',
}
