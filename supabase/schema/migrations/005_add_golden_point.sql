-- Migration 005: Add golden point configuration to tournaments

-- Add golden_point_enabled to tournaments
ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS golden_point_enabled BOOLEAN DEFAULT false;

-- Add comment
COMMENT ON COLUMN public.tournaments.golden_point_enabled IS 'Si está habilitado, en caso de empate al finalizar el tiempo se juega punto de oro (muerte súbita)';

-- Update existing tournaments (default false)
UPDATE public.tournaments SET golden_point_enabled = false WHERE golden_point_enabled IS NULL;
