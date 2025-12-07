'use server';

// =====================================================
// SERVER ACTIONS PARA GUIONES
// =====================================================

import * as repo from '@/lib/repo/scripts';
import type { Script, ScriptFrontmatter, ScriptScene } from '@/types/scripts';
import { revalidatePath } from 'next/cache';

// =====================================================
// PROYECTOS
// =====================================================

export async function createProjectAction(teamId: string, name: string, description?: string) {
  try {
    const project = await repo.createProject(teamId, name, description);
    revalidatePath('/admin/scripts');
    return { success: true, data: project };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateProjectAction(
  id: string,
  updates: { name?: string; description?: string }
) {
  try {
    const project = await repo.updateProject(id, updates);
    revalidatePath('/admin/scripts');
    return { success: true, data: project };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteProjectAction(id: string) {
  try {
    await repo.deleteProject(id);
    revalidatePath('/admin/scripts');
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message };
  }
}

// =====================================================
// GUIONES
// =====================================================

export async function createScriptAction(teamId: string, title: string, projectId?: string) {
  try {
    const script = await repo.createScript(teamId, title, projectId);
    revalidatePath('/admin/scripts');
    return { success: true, data: script };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateScriptAction(
  id: string,
  updates: Partial<Omit<Script, 'id' | 'team_id' | 'created_by' | 'created_at'>>
) {
  try {
    const script = await repo.updateScript(id, updates);
    revalidatePath('/admin/scripts');
    revalidatePath(`/admin/scripts/${id}`);
    return { success: true, data: script };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteScriptAction(id: string) {
  try {
    await repo.deleteScript(id);
    revalidatePath('/admin/scripts');
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message };
  }
}

// =====================================================
// ESCENAS
// =====================================================

export async function createSceneAction(
  scriptId: string,
  scene: Omit<ScriptScene, 'id' | 'script_id' | 'created_at' | 'updated_at'>
) {
  try {
    const newScene = await repo.createScene(scriptId, scene);
    revalidatePath(`/admin/scripts/${scriptId}`);
    return { success: true, data: newScene };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateSceneAction(
  id: string,
  scriptId: string,
  updates: Partial<Omit<ScriptScene, 'id' | 'script_id' | 'created_at' | 'updated_at'>>
) {
  try {
    const scene = await repo.updateScene(id, updates);
    revalidatePath(`/admin/scripts/${scriptId}`);
    return { success: true, data: scene };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message };
  }
}

export async function reorderScenesAction(scriptId: string, sceneIds: string[]) {
  try {
    await repo.reorderScenes(scriptId, sceneIds);
    revalidatePath(`/admin/scripts/${scriptId}`);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteSceneAction(id: string, scriptId: string) {
  try {
    await repo.deleteScene(id);
    revalidatePath(`/admin/scripts/${scriptId}`);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message };
  }
}

export async function bulkCreateScenesAction(
  scriptId: string,
  scenes: Omit<ScriptScene, 'id' | 'script_id' | 'created_at' | 'updated_at'>[]
) {
  try {
    const createdScenes = [];
    for (const scene of scenes) {
      const newScene = await repo.createScene(scriptId, scene);
      createdScenes.push(newScene);
    }
    revalidatePath(`/admin/scripts/${scriptId}`);
    return { success: true, data: createdScenes };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message };
  }
}

// =====================================================
// VERSIONES
// =====================================================

export async function createVersionAction(
  scriptId: string,
  mdx: string,
  mdxFrontmatter: ScriptFrontmatter
) {
  try {
    const version = await repo.createVersion(scriptId, mdx, mdxFrontmatter);
    revalidatePath(`/admin/scripts/${scriptId}`);
    return { success: true, data: version };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message };
  }
}

export async function revertToVersionAction(scriptId: string, versionId: string) {
  try {
    const script = await repo.revertToVersion(scriptId, versionId);
    revalidatePath(`/admin/scripts/${scriptId}`);
    return { success: true, data: script };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message };
  }
}

// =====================================================
// COMENTARIOS
// =====================================================

export async function createCommentAction(scriptId: string, body: string) {
  try {
    const comment = await repo.createComment(scriptId, body);
    revalidatePath(`/admin/scripts/${scriptId}`);
    return { success: true, data: comment };
  } catch (error: Error | unknown) {
    return { success: false, error: (error as Error).message };
  }
}

export async function resolveCommentAction(id: string, scriptId: string, resolved: boolean) {
  try {
    const comment = await repo.resolveComment(id, resolved);
    revalidatePath(`/admin/scripts/${scriptId}`);
    return { success: true, data: comment };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message };
  }
}

// =====================================================
// ASSETS
// =====================================================

export async function createAssetAction(
  scriptId: string,
  name: string,
  url: string,
  kind: string,
  sizeBytes?: number
) {
  try {
    const asset = await repo.createAsset(scriptId, name, url, kind, sizeBytes);
    revalidatePath(`/admin/scripts/${scriptId}`);
    return { success: true, data: asset };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteAssetAction(scriptId: string, id: string) {
  try {
    await repo.deleteAsset(id);
    revalidatePath(`/admin/scripts/${scriptId}`);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message };
  }
}

