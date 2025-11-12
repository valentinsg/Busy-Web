-- Migration 004: Normalize match phase

ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS phase TEXT,
  ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL;

ALTER TABLE public.matches DROP CONSTRAINT IF EXISTS matches_phase_check;
ALTER TABLE public.matches
  ADD CONSTRAINT matches_phase_check
  CHECK (phase IN ('groups', 'semifinals', 'third_place', 'final'));

-- Migrate existing round to phase
UPDATE public.matches
SET phase = CASE
  WHEN round IN ('group_a', 'group_b', 'group_c', 'group_d') THEN 'groups'
  WHEN round = 'semifinal' THEN 'semifinals'
  WHEN round = 'third_place' THEN 'third_place'
  WHEN round = 'final' THEN 'final'
  ELSE 'groups'
END
WHERE phase IS NULL;

-- Assign group_id for group matches
UPDATE public.matches m
SET group_id = (
  SELECT g.id FROM public.groups g
  WHERE g.tournament_id = m.tournament_id
  AND (
    LOWER(m.round) LIKE '%' || LOWER(g.name) || '%'
    OR m.team_a_id IN (SELECT id FROM public.teams WHERE group_id = g.id)
    OR m.team_b_id IN (SELECT id FROM public.teams WHERE group_id = g.id)
  )
  LIMIT 1
)
WHERE m.phase = 'groups' AND m.group_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_matches_phase ON public.matches(phase);
CREATE INDEX IF NOT EXISTS idx_matches_group ON public.matches(group_id);
