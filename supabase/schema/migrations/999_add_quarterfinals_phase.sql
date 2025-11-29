-- Add quarterfinals phase to matches_phase_check
ALTER TABLE public.matches DROP CONSTRAINT IF EXISTS matches_phase_check;
ALTER TABLE public.matches
  ADD CONSTRAINT matches_phase_check
  CHECK (phase IN ('groups', 'quarterfinals', 'semifinals', 'third_place', 'final'));
