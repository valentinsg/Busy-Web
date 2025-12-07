-- =====================================================
-- SHIPPING CONFIGURATION ENHANCEMENT
-- =====================================================
-- Adds advanced shipping configuration to shop_settings:
-- - free_shipping_enabled: Global toggle for free shipping (Black Friday, etc.)
-- - free_shipping_message: Custom message when free shipping is active
-- - province_rates: JSONB with per-province shipping rates
-- - mar_del_plata_rate: Special rate for local pickup/delivery
-- - default_carrier: Default shipping carrier name
-- =====================================================

-- Add new columns to shop_settings
ALTER TABLE public.shop_settings
ADD COLUMN IF NOT EXISTS free_shipping_enabled boolean NOT NULL DEFAULT false;

ALTER TABLE public.shop_settings
ADD COLUMN IF NOT EXISTS free_shipping_message text DEFAULT 'Envío gratis en todas las compras';

ALTER TABLE public.shop_settings
ADD COLUMN IF NOT EXISTS mar_del_plata_rate numeric NOT NULL DEFAULT 10000;

ALTER TABLE public.shop_settings
ADD COLUMN IF NOT EXISTS default_carrier text DEFAULT 'correo_argentino';

-- Province rates as JSONB for flexibility
-- Structure: { "province_code": { "rate": number, "enabled": boolean } }
-- Example: { "BA": { "rate": 8000, "enabled": true }, "CABA": { "rate": 11000, "enabled": true } }
ALTER TABLE public.shop_settings
ADD COLUMN IF NOT EXISTS province_rates jsonb DEFAULT '{}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.shop_settings.free_shipping_enabled IS 'Global toggle to enable free shipping on all orders (for special events like Black Friday)';
COMMENT ON COLUMN public.shop_settings.free_shipping_message IS 'Custom message to display when free shipping is enabled globally';
COMMENT ON COLUMN public.shop_settings.mar_del_plata_rate IS 'Special shipping rate for Mar del Plata (local delivery)';
COMMENT ON COLUMN public.shop_settings.province_rates IS 'JSONB with per-province shipping rates. Format: { "PROVINCE_CODE": { "rate": number, "enabled": boolean } }';
COMMENT ON COLUMN public.shop_settings.default_carrier IS 'Default shipping carrier name for display purposes';

-- Update existing row with default values if it exists
UPDATE public.shop_settings
SET
  free_shipping_enabled = COALESCE(free_shipping_enabled, false),
  free_shipping_message = COALESCE(free_shipping_message, 'Envío gratis en todas las compras'),
  mar_del_plata_rate = COALESCE(mar_del_plata_rate, 10000),
  default_carrier = COALESCE(default_carrier, 'correo_argentino'),
  province_rates = COALESCE(province_rates, '{}'::jsonb)
WHERE id IS NOT NULL;
