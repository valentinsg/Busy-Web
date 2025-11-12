-- Migration 001: Add match time fields and fouls

ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS current_period INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS elapsed_seconds INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS finished_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS fouls_a INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fouls_b INTEGER DEFAULT 0;

-- Update status constraint
ALTER TABLE public.matches DROP CONSTRAINT IF EXISTS matches_status_check;
ALTER TABLE public.matches 
  ADD CONSTRAINT matches_status_check 
  CHECK (status IN ('pending', 'live', 'halftime', 'finished', 'cancelled'));

-- Migrate existing status values
UPDATE public.matches SET status = 
  CASE 
    WHEN status = 'scheduled' THEN 'pending'
    WHEN status = 'in_progress' THEN 'live'
    WHEN status = 'completed' THEN 'finished'
    ELSE status
  END
WHERE status IN ('scheduled', 'in_progress', 'completed');
