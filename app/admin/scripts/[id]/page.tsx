'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ScriptEditorClient } from './script-editor-client';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type {
  Script,
  ScriptScene,
  ScriptVersion,
  ScriptComment,
  ScriptAsset,
  ScriptProject,
} from '@/types/scripts';

export default function ScriptEditorPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [script, setScript] = useState<Script | null>(null);
  const [scenes, setScenes] = useState<ScriptScene[]>([]);
  const [versions, setVersions] = useState<ScriptVersion[]>([]);
  const [comments, setComments] = useState<ScriptComment[]>([]);
  const [assets, setAssets] = useState<ScriptAsset[]>([]);
  const [projects, setProjects] = useState<ScriptProject[]>([]);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/admin/sign-in');
          return;
        }

        setTeamId(user.id);

        // Obtener el script
        const { data: scriptData, error: scriptError } = await supabase
          .from('scripts')
          .select('*')
          .eq('id', params.id)
          .single();

        if (scriptError || !scriptData || scriptData.team_id !== user.id) {
          setNotFound(true);
          setIsLoading(false);
          return;
        }

        setScript(scriptData);

        // Cargar datos relacionados
        const [
          scenesRes,
          versionsRes,
          commentsRes,
          assetsRes,
          projectsRes,
        ] = await Promise.all([
          supabase
            .from('script_scenes')
            .select('*')
            .eq('script_id', params.id)
            .order('idx', { ascending: true }),
          supabase
            .from('script_versions')
            .select('*')
            .eq('script_id', params.id)
            .order('version', { ascending: false }),
          supabase
            .from('script_comments')
            .select('*')
            .eq('script_id', params.id)
            .order('created_at', { ascending: true }),
          supabase
            .from('script_assets')
            .select('*')
            .eq('script_id', params.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('script_projects')
            .select('*')
            .eq('team_id', user.id)
            .order('updated_at', { ascending: false }),
        ]);

        setScenes(scenesRes.data || []);
        setVersions(versionsRes.data || []);
        setComments(commentsRes.data || []);
        setAssets(assetsRes.data || []);
        setProjects(projectsRes.data || []);
      } catch (error) {
        console.error('Error loading script:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [params.id, router]);

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Cargando guion..." />;
  }

  if (notFound || !script || !teamId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Guion no encontrado</h1>
          <p className="text-muted-foreground mb-4">
            El guion que buscas no existe o no tienes acceso a él.
          </p>
          <button
            onClick={() => router.push('/admin/scripts')}
            className="text-primary hover:underline"
          >
            Volver a guiones
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <ScriptEditorClient
        script={script}
        initialScenes={scenes}
        initialVersions={versions}
        initialComments={comments}
        initialAssets={assets}
        projects={projects}
        teamId={teamId}
      />
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div className="h-screen flex flex-col p-4 gap-4">
      <Skeleton className="h-16 w-full" />
      <div className="flex-1 grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <Skeleton className="h-full w-full" />
        </div>
        <Skeleton className="h-full w-full" />
      </div>
    </div>
  );
}
