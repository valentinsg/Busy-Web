-- Migration 003: Create groups table

CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id BIGINT NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT groups_tournament_name_unique UNIQUE(tournament_id, name),
  CONSTRAINT groups_tournament_order_unique UNIQUE(tournament_id, order_index)
);

CREATE INDEX IF NOT EXISTS idx_groups_tournament ON public.groups(tournament_id);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver grupos" ON public.groups FOR SELECT USING (true);
CREATE POLICY "Solo admins pueden modificar grupos" ON public.groups FOR ALL 
  USING (auth.role() = 'authenticated');

-- Add group_id to teams
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL;

-- Migrate existing data
INSERT INTO public.groups (tournament_id, name, display_name, order_index)
SELECT DISTINCT
  t.id AS tournament_id,
  COALESCE(NULLIF(REGEXP_REPLACE(teams.group_name, '[^A-Z]', '', 'g'), ''), 'A') AS name,
  COALESCE(teams.group_name, 'Zona A') AS display_name,
  ASCII(COALESCE(NULLIF(REGEXP_REPLACE(teams.group_name, '[^A-Z]', '', 'g'), ''), 'A')) - 64 AS order_index
FROM public.tournaments t
JOIN public.teams ON teams.tournament_id = t.id
WHERE teams.group_name IS NOT NULL
ON CONFLICT (tournament_id, name) DO NOTHING;

-- Assign group_id to existing teams
UPDATE public.teams
SET group_id = (
  SELECT g.id FROM public.groups g
  WHERE g.tournament_id = teams.tournament_id
  AND g.name = COALESCE(NULLIF(REGEXP_REPLACE(teams.group_name, '[^A-Z]', '', 'g'), ''), 'A')
  LIMIT 1
)
WHERE group_name IS NOT NULL AND group_id IS NULL;
