-- Migration 002: Add tournament time config and status

ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS period_duration_minutes INTEGER DEFAULT 8,
  ADD COLUMN IF NOT EXISTS periods_count INTEGER DEFAULT 2,
  ADD COLUMN IF NOT EXISTS tournament_status TEXT DEFAULT 'draft';

ALTER TABLE public.tournaments DROP CONSTRAINT IF EXISTS tournaments_status_check;
ALTER TABLE public.tournaments
  ADD CONSTRAINT tournaments_status_check
  CHECK (tournament_status IN ('draft', 'groups', 'playoffs', 'finished'));
