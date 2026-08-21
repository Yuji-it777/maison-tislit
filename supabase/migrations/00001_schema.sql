-- Maison Tislit - Supabase Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    CASE WHEN NEW.email = 'admin@maison-tislit.com' THEN true ELSE false END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Products
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('djellaba', 'takchita', 'gandoura', 'Caftan', 'Jabador', 'Accessoire')),
  price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  image TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  sizes TEXT[] NOT NULL DEFAULT '{}',
  colors TEXT[] NOT NULL DEFAULT '{}',
  badge TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read products" ON products;
CREATE POLICY "Anyone can read products"
  ON products FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can insert products" ON products;
CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

DROP POLICY IF EXISTS "Admins can update products" ON products;
CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

DROP POLICY IF EXISTS "Admins can delete products" ON products;
CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- 3. Orders
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'delivered')),
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

DROP POLICY IF EXISTS "Users can create orders" ON orders;
CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update orders" ON orders;
CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- 4. Order items
CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(10,2) NOT NULL,
  size TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '',
  custom_measurements TEXT
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))));

DROP POLICY IF EXISTS "Users can create order items" ON order_items;
CREATE POLICY "Users can create order items"
  ON order_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- 5. Messages
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  reply TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert messages" ON messages;
CREATE POLICY "Anyone can insert messages"
  ON messages FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read messages" ON messages;
CREATE POLICY "Admins can read messages"
  ON messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

DROP POLICY IF EXISTS "Admins can update messages" ON messages;
CREATE POLICY "Admins can update messages"
  ON messages FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

DROP POLICY IF EXISTS "Admins can delete messages" ON messages;
CREATE POLICY "Admins can delete messages"
  ON messages FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- 6. Seed products
INSERT INTO products (name, name_en, category, price, original_price, image, description, description_en, sizes, colors, badge, stock) VALUES
  ('Djellaba Royale Émeraude', 'Emerald Royal Djellaba', 'djellaba', 1850, 2200, '/images/djellaba-royale-emeraude.jpg', 'Une djellaba majestueuse en tissu brodé de fils dorés.', 'A majestic djellaba in gold-embroidered fabric.', '{XS,S,M,L,XL}', '{Émeraude,Bordeaux,Marine}', 'Bestseller', 12),
  ('Djellaba Safira Bleue', 'Blue Safira Djellaba', 'djellaba', 1650, NULL, '/images/djellaba2.jpg', 'Djellaba en soie naturelle bleu royal.', 'Royal blue natural silk djellaba.', '{XS,S,M,L,XL,XXL}', '{Bleu Royal,Indigo,Turquoise}', 'Nouveau', 5),
  ('Takchita Nour Al-Qamar', 'Nour Al-Qamar Takchita', 'takchita', 3200, 3800, '/images/takchita1.jpg', 'Une takchita somptueuse deux pièces en crêpe ivoire.', 'A sumptuous two-piece takchita in ivory crepe.', '{XS,S,M,L}', '{Ivoire & Or,Blanc & Argent}', 'Premium', 3),
  ('Takchita Rosa Enchantée', 'Enchanted Rosa Takchita', 'takchita', 2900, NULL, '/images/takchita2.jpg', 'Takchita romantique en rose poudré.', 'Romantic takchita in powder pink.', '{XS,S,M,L,XL}', '{Rose Poudré,Champagne,Pêche}', 'Collection Spéciale', 7),
  ('Gandoura Sultana Bordeaux', 'Bordeaux Sultana Gandoura', 'gandoura', 1200, 1450, '/images/gandoura1.jpg', 'Gandoura sans manches en velours bordeaux.', 'Sleeveless gandoura in burgundy velvet.', '{XS,S,M,L,XL,XXL}', '{Bordeaux,Rubis,Prune}', 'Promo', 20),
  ('Gandoura Jasmine Blanche', 'White Jasmine Gandoura', 'gandoura', 980, NULL, '/images/gandoura1.jpg', 'Gandoura légère en coton blanc.', 'Lightweight white cotton gandoura.', '{S,M,L,XL}', '{Blanc Cassé,Écru,Crème}', NULL, 2),
  ('Caftan Royal Brodé', 'Embroidered Royal Caftan', 'Caftan', 2800, NULL, '/images/djellaba1.jpg', 'Caftan en velours brodé main.', 'Hand-embroidered velvet caftan.', '{S,M,L,XL}', '{Or,Argent,Rose Gold}', NULL, 12),
  ('Takchita Fassia', 'Fassi Takchita', 'takchita', 4500, NULL, '/images/takchita1.jpg', 'Ensemble deux pièces traditionnel.', 'Traditional two-piece ensemble.', '{XS,S,M,L}', '{Blanc,Ivoire,Champagne}', 'Premium', 3),
  ('Jabador Soie', 'Silk Jabador', 'Jabador', 1900, NULL, '/images/gandoura1.jpg', 'Jabador en soie pure.', 'Pure silk jabador.', '{S,M,L,XL}', '{Blanc,Noir,Rouge}', NULL, 0),
  ('Ceinture Dorée', 'Golden Belt', 'Accessoire', 350, NULL, '/images/gandoura1.jpg', 'Ceinture tissée or.', 'Woven gold belt.', '{Unique}', '{Or,Argent}', NULL, 25)
ON CONFLICT DO NOTHING;

-- 8. Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read reviews" ON reviews;
CREATE POLICY "Anyone can read reviews"
  ON reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert reviews" ON reviews;
CREATE POLICY "Users can insert reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 9. Newsletter Subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert subscriber" ON newsletter_subscribers;
CREATE POLICY "Anyone can insert subscriber"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read subscribers" ON newsletter_subscribers;
CREATE POLICY "Admins can read subscribers"
  ON newsletter_subscribers FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- 7. Seed admin profile for existing auth user (run manually after creating admin user in auth):
-- INSERT INTO profiles (id, name, email, is_admin)
-- VALUES ('<USER_UUID>', 'Admin Maison Tislit', 'admin@maison-tislit.com', true)
-- ON CONFLICT (id) DO UPDATE SET is_admin = true;
