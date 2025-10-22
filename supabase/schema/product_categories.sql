-- Product Categories Table
-- Stores product categories with display names and slugs

CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_product_categories_slug ON product_categories(slug);
CREATE INDEX IF NOT EXISTS idx_product_categories_active ON product_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_product_categories_order ON product_categories(display_order);

-- Enable RLS
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Public can read active categories
CREATE POLICY "Anyone can view active categories"
  ON product_categories
  FOR SELECT
  USING (is_active = true);

-- Only authenticated users can manage categories (admin check should be done in app)
CREATE POLICY "Authenticated users can manage categories"
  ON product_categories
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_product_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_product_categories_updated_at
  BEFORE UPDATE ON product_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_product_categories_updated_at();

-- Insert default categories
INSERT INTO product_categories (slug, name, description, display_order) VALUES
  ('buzos', 'Buzos', 'Hoodies y sudaderas streetwear', 1),
  ('remeras', 'Remeras', 'Remeras y camisetas', 2),
  ('pantalones', 'Pantalones', 'Pantalones cargo y joggers', 3),
  ('accesorios', 'Accesorios', 'Accesorios y complementos', 4),
  ('ofertas', 'Ofertas', 'Productos en oferta', 5)
ON CONFLICT (slug) DO NOTHING;

COMMENT ON TABLE product_categories IS 'Product categories for organizing products';
COMMENT ON COLUMN product_categories.slug IS 'URL-friendly identifier (e.g., "buzos", "remeras")';
COMMENT ON COLUMN product_categories.name IS 'Display name (e.g., "Buzos", "Remeras")';
COMMENT ON COLUMN product_categories.description IS 'Optional category description';
COMMENT ON COLUMN product_categories.display_order IS 'Order for displaying categories (lower = first)';
COMMENT ON COLUMN product_categories.is_active IS 'Whether the category is visible to users';
