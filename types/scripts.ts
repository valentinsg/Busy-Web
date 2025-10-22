// =====================================================
// TIPOS DEL MÓDULO DE GUIONES
// =====================================================

export type ScriptStatus = 'idea' | 'outline' | 'draft' | 'review' | 'approved' | 'published';

export type ScriptPlatform = 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'twitter' | 'other';

export type ShotType = 'wide' | 'medium' | 'close-up' | 'detail' | 'pov' | 'over-shoulder' | 'aerial' | 'other';

export type AssetKind = 'image' | 'video' | 'pdf' | 'other';

export interface ScriptProject {
  id: string;
  team_id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ScriptFrontmatter {
  hook?: string;
  cta?: string;
  tone?: string;
  target_audience?: string;
  music_style?: string;
  voiceover?: boolean;
  subtitles?: boolean;
  safe_zones?: boolean;
  [key: string]: any;
}

export interface Script {
  id: string;
  project_id?: string;
  team_id: string;
  title: string;
  slug: string;
  status: ScriptStatus;
  category?: string;
  tags: string[];
  platform?: ScriptPlatform;
  est_duration_seconds?: number;
  cover_asset_url?: string;
  mdx: string;
  mdx_frontmatter: ScriptFrontmatter;
  version: number;
  created_by: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ScriptScene {
  id: string;
  script_id: string;
  idx: number;
  heading: string;
  objective?: string;
  dialogue_mdx?: string;
  broll_notes?: string;
  duration_seconds?: number;
  shot_type?: ShotType;
  location?: string;
  props?: string;
  created_at: string;
  updated_at: string;
}

export interface ScriptVersion {
  id: string;
  script_id: string;
  version: number;
  mdx: string;
  mdx_frontmatter: ScriptFrontmatter;
  created_by: string;
  created_at: string;
}

export interface ScriptComment {
  id: string;
  script_id: string;
  author_id: string;
  body: string;
  resolved: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScriptAsset {
  id: string;
  script_id: string;
  name: string;
  url: string;
  kind: AssetKind;
  size_bytes?: number;
  created_by: string;
  created_at: string;
}

// =====================================================
// TIPOS PARA PLANTILLAS
// =====================================================

export interface ScriptTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  platform: ScriptPlatform;
  est_duration_seconds: number;
  mdx: string;
  frontmatter: ScriptFrontmatter;
  scenes: Omit<ScriptScene, 'id' | 'script_id' | 'created_at' | 'updated_at'>[];
}

// =====================================================
// TIPOS PARA VALIDACIONES
// =====================================================

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationResult {
  id: string;
  severity: ValidationSeverity;
  message: string;
  field?: string;
}

// =====================================================
// TIPOS PARA CHECKLIST DE PLATAFORMA
// =====================================================

export interface PlatformChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  required: boolean;
}

export interface PlatformChecklist {
  platform: ScriptPlatform;
  items: PlatformChecklistItem[];
  recommendations: string[];
}

// =====================================================
// TIPOS PARA EXPORTS
// =====================================================

export interface ShotlistRow {
  idx: number;
  heading: string;
  objective: string;
  shot_type: string;
  duration_seconds: number;
  broll_notes: string;
}

// =====================================================
// TIPOS PARA BÚSQUEDA
// =====================================================

export interface ScriptSearchFilters {
  query?: string;
  status?: ScriptStatus;
  category?: string;
  project_id?: string;
  tag?: string;
}

export interface ScriptSearchResult extends Script {
  rank?: number;
}
