-- Add christmas_mode column to shop_settings for seasonal theme toggle
-- Run this migration in Supabase SQL Editor

ALTER TABLE public.shop_settings
ADD COLUMN IF NOT EXISTS christmas_mode boolean NOT NULL DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.shop_settings.christmas_mode IS 'Toggle for Christmas theme effects (snowflakes, festive colors)';
