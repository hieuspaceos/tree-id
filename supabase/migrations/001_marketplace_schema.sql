-- Migration: 001_marketplace_schema
-- Marketplace tables for tree-id: profiles, products, orders, order_items, licenses, payment_events

-- Auto-update updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Users extend Supabase Auth (auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  locale TEXT DEFAULT 'vi',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Products listed in marketplace
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  category TEXT NOT NULL, -- 'template', 'tool', 'service', 'plugin'
  price_vnd BIGINT NOT NULL DEFAULT 0, -- Price in VND (no decimals)
  price_usd INTEGER DEFAULT 0,         -- Price in USD cents
  currency TEXT DEFAULT 'VND',
  status TEXT DEFAULT 'draft',          -- draft, published, archived
  cover_image TEXT,
  gallery JSONB DEFAULT '[]',
  features JSONB DEFAULT '[]',          -- Feature list for product page
  metadata JSONB DEFAULT '{}',          -- Flexible metadata
  landing_slug TEXT,                    -- Link to existing landing page
  download_url TEXT,                    -- R2 URL for deliverable
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,    -- Human-readable: ORD-20260327-XXXX
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT DEFAULT 'pending',        -- pending, paid, fulfilled, cancelled, refunded
  total_vnd BIGINT NOT NULL DEFAULT 0,
  total_usd INTEGER DEFAULT 0,
  payment_method TEXT,                  -- 'sepay', 'stripe'
  payment_id TEXT,                      -- External payment reference
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Order line items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  price_vnd BIGINT NOT NULL,
  price_usd INTEGER DEFAULT 0,
  quantity INTEGER DEFAULT 1
);

-- Licenses (post-purchase access)
CREATE TABLE public.licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  product_id UUID NOT NULL REFERENCES public.products(id),
  order_id UUID NOT NULL REFERENCES public.orders(id),
  license_key TEXT UNIQUE NOT NULL,     -- Generated key
  status TEXT DEFAULT 'active',         -- active, revoked, expired
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,               -- NULL = lifetime
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment events log (webhook audit trail)
CREATE TABLE public.payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id),
  provider TEXT NOT NULL,               -- 'sepay', 'stripe'
  event_type TEXT NOT NULL,             -- 'payment_received', 'refund', etc.
  payload JSONB NOT NULL,               -- Raw webhook payload
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_licenses_user ON public.licenses(user_id);
CREATE INDEX idx_licenses_product ON public.licenses(product_id);
CREATE INDEX idx_payment_events_order ON public.payment_events(order_id);

-- Row Level Security

-- Profiles: users can read/update own profile
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Products: anyone can read published, admin can write
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads published products" ON public.products FOR SELECT USING (status = 'published');
CREATE POLICY "Admin manages products" ON public.products FOR ALL USING (
  auth.jwt() ->> 'role' = 'admin'
);

-- Orders: users see own orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);

-- Order items: users see items in own orders
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- Licenses: users see own licenses
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own licenses" ON public.licenses FOR SELECT USING (auth.uid() = user_id);

-- Payment events: admin only
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin reads payment events" ON public.payment_events FOR SELECT USING (
  auth.jwt() ->> 'role' = 'admin'
);
