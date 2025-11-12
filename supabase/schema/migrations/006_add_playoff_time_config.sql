-- Migration 006: Add playoff time configuration to tournaments

-- Add playoff time configuration
ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS playoff_period_duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS playoff_periods_count INTEGER;

-- Comments
COMMENT ON COLUMN public.tournaments.playoff_period_duration_minutes IS 'Duración de cada período en playoffs (minutos). Si es NULL, usa period_duration_minutes';
COMMENT ON COLUMN public.tournaments.playoff_periods_count IS 'Cantidad de períodos en playoffs. Si es NULL, usa periods_count';

-- Update existing tournaments (NULL = usar configuración de grupos)
UPDATE public.tournaments 
SET 
  playoff_period_duration_minutes = NULL,
  playoff_periods_count = NULL 
WHERE playoff_period_duration_minutes IS NULL;
