-- =====================================================
-- MÓDULO DE GUIONES (SCRIPTS)
-- Sistema privado para equipo admin de Busy
-- =====================================================

-- Tabla de proyectos (colecciones de guiones)
CREATE TABLE IF NOT EXISTS public.script_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla principal de guiones
CREATE TABLE IF NOT EXISTS public.scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.script_projects(id) ON DELETE SET NULL,
  team_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'outline', 'draft', 'review', 'approved', 'published')),
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  platform TEXT, -- 'instagram', 'tiktok', 'youtube', etc.
  est_duration_seconds INTEGER,
  cover_asset_url TEXT,
  mdx TEXT NOT NULL DEFAULT '',
  mdx_frontmatter JSONB DEFAULT '{}',
  version INTEGER NOT NULL DEFAULT 1,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  search_index TSVECTOR,
  UNIQUE(team_id, slug)
);

-- Tabla de escenas (storyboard)
CREATE TABLE IF NOT EXISTS public.script_scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID NOT NULL REFERENCES public.scripts(id) ON DELETE CASCADE,
  idx INTEGER NOT NULL,
  heading TEXT NOT NULL,
  objective TEXT,
  dialogue_mdx TEXT,
  broll_notes TEXT,
  duration_seconds INTEGER,
  shot_type TEXT, -- 'wide', 'medium', 'close-up', 'detail', etc.
  location TEXT,
  props TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(script_id, idx)
);

-- Tabla de versiones (snapshots)
CREATE TABLE IF NOT EXISTS public.script_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID NOT NULL REFERENCES public.scripts(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  mdx TEXT NOT NULL,
  mdx_frontmatter JSONB DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(script_id, version)
);

-- Tabla de comentarios
CREATE TABLE IF NOT EXISTS public.script_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID NOT NULL REFERENCES public.scripts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  body TEXT NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de adjuntos (assets)
CREATE TABLE IF NOT EXISTS public.script_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID NOT NULL REFERENCES public.scripts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  kind TEXT NOT NULL, -- 'image', 'video', 'pdf', 'other'
  size_bytes INTEGER,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_script_projects_team_id ON public.script_projects(team_id);
CREATE INDEX IF NOT EXISTS idx_scripts_team_id ON public.scripts(team_id);
CREATE INDEX IF NOT EXISTS idx_scripts_project_id ON public.scripts(project_id);
CREATE INDEX IF NOT EXISTS idx_scripts_status ON public.scripts(status);
CREATE INDEX IF NOT EXISTS idx_scripts_category ON public.scripts(category);
CREATE INDEX IF NOT EXISTS idx_scripts_platform ON public.scripts(platform);
CREATE INDEX IF NOT EXISTS idx_scripts_search_index ON public.scripts USING GIN(search_index);
CREATE INDEX IF NOT EXISTS idx_script_scenes_script_id ON public.script_scenes(script_id);
CREATE INDEX IF NOT EXISTS idx_script_scenes_idx ON public.script_scenes(script_id, idx);
CREATE INDEX IF NOT EXISTS idx_script_versions_script_id ON public.script_versions(script_id);
CREATE INDEX IF NOT EXISTS idx_script_comments_script_id ON public.script_comments(script_id);
CREATE INDEX IF NOT EXISTS idx_script_assets_script_id ON public.script_assets(script_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_script_projects_updated_at BEFORE UPDATE ON public.script_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scripts_updated_at BEFORE UPDATE ON public.scripts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_script_scenes_updated_at BEFORE UPDATE ON public.script_scenes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_script_comments_updated_at BEFORE UPDATE ON public.script_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Actualizar search_index automáticamente
CREATE OR REPLACE FUNCTION update_scripts_search_index()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_index :=
    setweight(to_tsvector('spanish', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('spanish', COALESCE(NEW.category, '')), 'B') ||
    setweight(to_tsvector('spanish', COALESCE(array_to_string(NEW.tags, ' '), '')), 'B') ||
    setweight(to_tsvector('spanish', COALESCE(NEW.mdx, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scripts_search_trigger BEFORE INSERT OR UPDATE ON public.scripts
  FOR EACH ROW EXECUTE FUNCTION update_scripts_search_index();

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================

ALTER TABLE public.script_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.script_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.script_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.script_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.script_assets ENABLE ROW LEVEL SECURITY;

-- Políticas para script_projects
CREATE POLICY "Team members can view their projects"
  ON public.script_projects FOR SELECT
  USING (auth.uid() = team_id);

CREATE POLICY "Team members can insert their projects"
  ON public.script_projects FOR INSERT
  WITH CHECK (auth.uid() = team_id);

CREATE POLICY "Team members can update their projects"
  ON public.script_projects FOR UPDATE
  USING (auth.uid() = team_id);

CREATE POLICY "Team members can delete their projects"
  ON public.script_projects FOR DELETE
  USING (auth.uid() = team_id);

-- Políticas para scripts
CREATE POLICY "Team members can view their scripts"
  ON public.scripts FOR SELECT
  USING (auth.uid() = team_id);

CREATE POLICY "Team members can insert their scripts"
  ON public.scripts FOR INSERT
  WITH CHECK (auth.uid() = team_id);

CREATE POLICY "Team members can update their scripts"
  ON public.scripts FOR UPDATE
  USING (auth.uid() = team_id);

CREATE POLICY "Team members can delete their scripts"
  ON public.scripts FOR DELETE
  USING (auth.uid() = team_id);

-- Políticas para script_scenes
CREATE POLICY "Team members can view scenes"
  ON public.script_scenes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.scripts WHERE scripts.id = script_scenes.script_id AND scripts.team_id = auth.uid()
  ));

CREATE POLICY "Team members can insert scenes"
  ON public.script_scenes FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.scripts WHERE scripts.id = script_scenes.script_id AND scripts.team_id = auth.uid()
  ));

CREATE POLICY "Team members can update scenes"
  ON public.script_scenes FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.scripts WHERE scripts.id = script_scenes.script_id AND scripts.team_id = auth.uid()
  ));

CREATE POLICY "Team members can delete scenes"
  ON public.script_scenes FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.scripts WHERE scripts.id = script_scenes.script_id AND scripts.team_id = auth.uid()
  ));

-- Políticas para script_versions
CREATE POLICY "Team members can view versions"
  ON public.script_versions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.scripts WHERE scripts.id = script_versions.script_id AND scripts.team_id = auth.uid()
  ));

CREATE POLICY "Team members can insert versions"
  ON public.script_versions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.scripts WHERE scripts.id = script_versions.script_id AND scripts.team_id = auth.uid()
  ));

-- Políticas para script_comments
CREATE POLICY "Team members can view comments"
  ON public.script_comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.scripts WHERE scripts.id = script_comments.script_id AND scripts.team_id = auth.uid()
  ));

CREATE POLICY "Team members can insert comments"
  ON public.script_comments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.scripts WHERE scripts.id = script_comments.script_id AND scripts.team_id = auth.uid()
  ));

CREATE POLICY "Team members can update comments"
  ON public.script_comments FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.scripts WHERE scripts.id = script_comments.script_id AND scripts.team_id = auth.uid()
  ));

-- Políticas para script_assets
CREATE POLICY "Team members can view assets"
  ON public.script_assets FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.scripts WHERE scripts.id = script_assets.script_id AND scripts.team_id = auth.uid()
  ));

CREATE POLICY "Team members can insert assets"
  ON public.script_assets FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.scripts WHERE scripts.id = script_assets.script_id AND scripts.team_id = auth.uid()
  ));

CREATE POLICY "Team members can delete assets"
  ON public.script_assets FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.scripts WHERE scripts.id = script_assets.script_id AND scripts.team_id = auth.uid()
  ));

-- =====================================================
-- FUNCIONES DE BÚSQUEDA
-- =====================================================

CREATE OR REPLACE FUNCTION search_scripts(
  p_team_id UUID,
  p_query TEXT,
  p_status TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL,
  p_project_id UUID DEFAULT NULL,
  p_tag TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  status TEXT,
  category TEXT,
  tags TEXT[],
  platform TEXT,
  est_duration_seconds INTEGER,
  project_id UUID,
  updated_at TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.title,
    s.slug,
    s.status,
    s.category,
    s.tags,
    s.platform,
    s.est_duration_seconds,
    s.project_id,
    s.updated_at,
    ts_rank(s.search_index, websearch_to_tsquery('spanish', p_query)) AS rank
  FROM public.scripts s
  WHERE s.team_id = p_team_id
    AND (p_query IS NULL OR s.search_index @@ websearch_to_tsquery('spanish', p_query))
    AND (p_status IS NULL OR s.status = p_status)
    AND (p_category IS NULL OR s.category = p_category)
    AND (p_project_id IS NULL OR s.project_id = p_project_id)
    AND (p_tag IS NULL OR p_tag = ANY(s.tags))
  ORDER BY
    CASE WHEN p_query IS NOT NULL THEN ts_rank(s.search_index, websearch_to_tsquery('spanish', p_query)) ELSE 0 END DESC,
    s.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Políticas de storage (ejecutar después de crear el bucket)
CREATE POLICY "Team members can upload assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'scripts-assets' AND auth.uid() IS NOT NULL);

CREATE POLICY "Team members can view assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'scripts-assets' AND auth.uid() IS NOT NULL);

CREATE POLICY "Team members can delete assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'scripts-assets' AND auth.uid() IS NOT NULL);
