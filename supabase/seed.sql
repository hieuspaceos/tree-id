-- Seed marketplace with sample products for development
INSERT INTO public.products (slug, title, description, short_description, category, price_vnd, price_usd, currency, status, features) VALUES
(
  'claudekit-engineer',
  'ClaudeKit Engineer',
  'Production-ready AI subagents for development workflows',
  'AI dev team in a box',
  'tool',
  2490000,
  9900,
  'VND',
  'published',
  '["Multi-agent orchestration", "Code review automation", "Test generation", "Documentation sync"]'::jsonb
),
(
  'claudekit-marketing',
  'ClaudeKit Marketing',
  'AI-powered content creation and distribution pipeline',
  'AI marketing team',
  'tool',
  2490000,
  9900,
  'VND',
  'published',
  '["Content generation", "Social media scheduling", "SEO optimization", "Analytics dashboard"]'::jsonb
),
(
  'astro-starter-template',
  'Astro Starter Template',
  'Production-ready Astro template with CMS, auth, and marketplace',
  'Full-stack Astro template',
  'template',
  990000,
  3900,
  'VND',
  'published',
  '["Hybrid SSR", "Admin dashboard", "Landing page builder", "Content management"]'::jsonb
);
