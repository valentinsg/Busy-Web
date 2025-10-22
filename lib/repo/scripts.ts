// =====================================================
// REPOSITORIO DE GUIONES
// =====================================================

import { createClient } from '@/lib/supabase/server';
import type {
  Script,
  ScriptProject,
  ScriptScene,
  ScriptVersion,
  ScriptComment,
  ScriptAsset,
  ScriptSearchFilters,
  ScriptSearchResult,
} from '@/types/scripts';

// =====================================================
// PROYECTOS
// =====================================================

export async function getProjects(teamId: string): Promise<ScriptProject[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('script_projects')
    .select('*')
    .eq('team_id', teamId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getProjectById(id: string): Promise<ScriptProject | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('script_projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function createProject(
  teamId: string,
  name: string,
  description?: string
): Promise<ScriptProject> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('script_projects')
    .insert({
      team_id: teamId,
      name,
      description,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProject(
  id: string,
  updates: Partial<Pick<ScriptProject, 'name' | 'description'>>
): Promise<ScriptProject> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('script_projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('script_projects')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// =====================================================
// GUIONES
// =====================================================

export async function getScripts(teamId: string): Promise<Script[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('scripts')
    .select('*')
    .eq('team_id', teamId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getScriptById(id: string): Promise<Script | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('scripts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function getScriptBySlug(teamId: string, slug: string): Promise<Script | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('scripts')
    .select('*')
    .eq('team_id', teamId)
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data;
}

export async function createScript(
  teamId: string,
  title: string,
  projectId?: string
): Promise<Script> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const { data, error } = await supabase
    .from('scripts')
    .insert({
      team_id: teamId,
      project_id: projectId,
      title,
      slug,
      created_by: user.id,
      updated_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateScript(
  id: string,
  updates: Partial<Omit<Script, 'id' | 'team_id' | 'created_by' | 'created_at'>>
): Promise<Script> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('scripts')
    .update({
      ...updates,
      updated_by: user.id,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteScript(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('scripts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function searchScripts(
  teamId: string,
  filters: ScriptSearchFilters
): Promise<ScriptSearchResult[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('search_scripts', {
    p_team_id: teamId,
    p_query: filters.query || null,
    p_status: filters.status || null,
    p_category: filters.category || null,
    p_project_id: filters.project_id || null,
    p_tag: filters.tag || null,
  });

  if (error) throw error;
  return data || [];
}

// =====================================================
// ESCENAS
// =====================================================

export async function getScenes(scriptId: string): Promise<ScriptScene[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('script_scenes')
    .select('*')
    .eq('script_id', scriptId)
    .order('idx', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createScene(
  scriptId: string,
  scene: Omit<ScriptScene, 'id' | 'script_id' | 'created_at' | 'updated_at'>
): Promise<ScriptScene> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('script_scenes')
    .insert({
      script_id: scriptId,
      ...scene,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateScene(
  id: string,
  updates: Partial<Omit<ScriptScene, 'id' | 'script_id' | 'created_at' | 'updated_at'>>
): Promise<ScriptScene> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('script_scenes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function reorderScenes(
  scriptId: string,
  sceneIds: string[]
): Promise<void> {
  const supabase = await createClient();
  
  // Actualizar índices en batch
  const updates = sceneIds.map((id, idx) => ({
    id,
    idx,
  }));

  for (const update of updates) {
    await supabase
      .from('script_scenes')
      .update({ idx: update.idx })
      .eq('id', update.id)
      .eq('script_id', scriptId);
  }
}

export async function deleteScene(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('script_scenes')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// =====================================================
// VERSIONES
// =====================================================

export async function getVersions(scriptId: string): Promise<ScriptVersion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('script_versions')
    .select('*')
    .eq('script_id', scriptId)
    .order('version', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createVersion(
  scriptId: string,
  mdx: string,
  mdxFrontmatter: any
): Promise<ScriptVersion> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Obtener el script actual para incrementar la versión
  const script = await getScriptById(scriptId);
  if (!script) throw new Error('Script not found');

  const newVersion = script.version + 1;

  // Crear snapshot
  const { data, error } = await supabase
    .from('script_versions')
    .insert({
      script_id: scriptId,
      version: script.version, // Guardar la versión ACTUAL
      mdx: script.mdx,
      mdx_frontmatter: script.mdx_frontmatter,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  // Actualizar el script con la nueva versión
  await updateScript(scriptId, {
    version: newVersion,
    mdx,
    mdx_frontmatter: mdxFrontmatter,
  });

  return data;
}

export async function revertToVersion(
  scriptId: string,
  versionId: string
): Promise<Script> {
  const supabase = await createClient();
  
  // Obtener la versión
  const { data: version, error: versionError } = await supabase
    .from('script_versions')
    .select('*')
    .eq('id', versionId)
    .single();

  if (versionError) throw versionError;

  // Actualizar el script
  return await updateScript(scriptId, {
    mdx: version.mdx,
    mdx_frontmatter: version.mdx_frontmatter,
  });
}

// =====================================================
// COMENTARIOS
// =====================================================

export async function getComments(scriptId: string): Promise<ScriptComment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('script_comments')
    .select('*')
    .eq('script_id', scriptId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createComment(
  scriptId: string,
  body: string
): Promise<ScriptComment> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('script_comments')
    .insert({
      script_id: scriptId,
      author_id: user.id,
      body,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function resolveComment(id: string, resolved: boolean): Promise<ScriptComment> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('script_comments')
    .update({ resolved })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =====================================================
// ASSETS
// =====================================================

export async function getAssets(scriptId: string): Promise<ScriptAsset[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('script_assets')
    .select('*')
    .eq('script_id', scriptId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createAsset(
  scriptId: string,
  name: string,
  url: string,
  kind: string,
  sizeBytes?: number
): Promise<ScriptAsset> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('script_assets')
    .insert({
      script_id: scriptId,
      name,
      url,
      kind,
      size_bytes: sizeBytes,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAsset(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('script_assets')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function uploadAssetFile(
  file: File,
  scriptId: string
): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const fileExt = file.name.split('.').pop();
  const fileName = `${scriptId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('scripts-assets')
    .upload(fileName, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('scripts-assets')
    .getPublicUrl(fileName);

  return publicUrl;
}
