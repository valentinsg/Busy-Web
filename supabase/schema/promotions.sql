-- ============================================
-- TABLA: promotions
-- Gestión de promociones personalizables
-- ============================================

CREATE TABLE IF NOT EXISTS public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Información básica
  name text NOT NULL, -- Nombre de la promo (ej: "2x1 Remeras Básicas", "Outfit Completo")
  description text, -- Descripción detallada
  active boolean NOT NULL DEFAULT true,
  
  -- Tipo de promoción
  promo_type text NOT NULL, -- 'nxm', 'percentage_off', 'fixed_amount', 'combo', 'bundle'
  
  -- Configuración según tipo
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- Ejemplos de config:
  -- 2x1: {"buy": 2, "pay": 1}
  -- 3x2: {"buy": 3, "pay": 2}
  -- 2da unidad 50%: {"nth_unit": 2, "discount_percent": 50}
  -- Combo: {"required_skus": ["BUSY-TEE001", "BUSY-PANT001"], "discount_percent": 20}
  -- Bundle: {"sku_groups": [["BUSY-TEE001", "BUSY-TEE002"], ["BUSY-PANT001"]], "discount_amount": 5000}
  
  -- Productos elegibles (array de SKUs o prefijos)
  eligible_skus text[] NOT NULL DEFAULT '{}', -- SKUs específicos o prefijos (ej: ["BUSY-BASIC", "BUSY-TEE001"])
  sku_match_type text NOT NULL DEFAULT 'prefix', -- 'exact' o 'prefix'
  
  -- Restricciones
  min_quantity integer, -- Cantidad mínima de productos
  max_uses_per_customer integer, -- Límite de usos por cliente
  max_total_uses integer, -- Límite total de usos
  current_uses integer NOT NULL DEFAULT 0, -- Contador de usos
  
  -- Prioridad (mayor número = mayor prioridad)
  priority integer NOT NULL DEFAULT 0,
  
  -- Vigencia
  starts_at timestamptz,
  ends_at timestamptz,
  
  -- Metadata
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT valid_promo_type CHECK (promo_type IN ('nxm', 'percentage_off', 'fixed_amount', 'combo', 'bundle', 'nth_unit_discount')),
  CONSTRAINT valid_sku_match CHECK (sku_match_type IN ('exact', 'prefix')),
  CONSTRAINT valid_priority CHECK (priority >= 0)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_promotions_active ON public.promotions(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON public.promotions(starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_promotions_priority ON public.promotions(priority DESC);
CREATE INDEX IF NOT EXISTS idx_promotions_eligible_skus ON public.promotions USING gin(eligible_skus);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_promotions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER promotions_updated_at
  BEFORE UPDATE ON public.promotions
  FOR EACH ROW
  EXECUTE FUNCTION update_promotions_updated_at();

-- RLS Policies
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Todos pueden ver promociones activas
CREATE POLICY "Promotions are viewable by everyone"
  ON public.promotions FOR SELECT
  USING (active = true);

-- Solo admins pueden crear/editar/eliminar
CREATE POLICY "Admins can manage promotions"
  ON public.promotions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Comentarios
COMMENT ON TABLE public.promotions IS 'Sistema de promociones personalizable para e-commerce';
COMMENT ON COLUMN public.promotions.promo_type IS 'Tipo de promoción: nxm (2x1, 3x2), percentage_off (% desc), fixed_amount ($ fijo), combo (productos específicos), bundle (grupos), nth_unit_discount (2da unidad X%)';
COMMENT ON COLUMN public.promotions.config IS 'Configuración JSON específica del tipo de promoción';
COMMENT ON COLUMN public.promotions.eligible_skus IS 'Array de SKUs o prefijos elegibles para la promoción';
COMMENT ON COLUMN public.promotions.sku_match_type IS 'Tipo de match: exact (SKU exacto) o prefix (por prefijo)';

-- Ejemplos de inserts
-- 2x1 en remeras básicas
INSERT INTO public.promotions (name, description, promo_type, config, eligible_skus, sku_match_type, priority)
VALUES (
  '2x1 Remeras Básicas',
  'Llevá 2 remeras básicas y pagá solo 1',
  'nxm',
  '{"buy": 2, "pay": 1}'::jsonb,
  ARRAY['BUSY-BASIC'],
  'prefix',
  10
);

-- 3x2 en buzos
INSERT INTO public.promotions (name, description, promo_type, config, eligible_skus, sku_match_type, priority)
VALUES (
  '3x2 en Buzos',
  'Llevá 3 buzos y pagá solo 2',
  'nxm',
  '{"buy": 3, "pay": 2}'::jsonb,
  ARRAY['BUSY-HOODIE', 'BUSY-SWEAT'],
  'prefix',
  10
);

-- 2da unidad 50% off
INSERT INTO public.promotions (name, description, promo_type, config, eligible_skus, sku_match_type, priority)
VALUES (
  '2da Unidad 50% OFF',
  'En la segunda unidad del mismo producto, 50% de descuento',
  'nth_unit_discount',
  '{"nth_unit": 2, "discount_percent": 50}'::jsonb,
  ARRAY['BUSY-PREMIUM'],
  'prefix',
  5
);

-- Combo Outfit: Remera + Pantalón
INSERT INTO public.promotions (name, description, promo_type, config, eligible_skus, sku_match_type, priority)
VALUES (
  'Outfit Completo',
  'Remera + Pantalón con 20% de descuento',
  'combo',
  '{"required_skus": ["BUSY-TEE", "BUSY-PANT"], "discount_percent": 20, "match_type": "prefix"}'::jsonb,
  ARRAY['BUSY-TEE', 'BUSY-PANT'],
  'prefix',
  15
);
