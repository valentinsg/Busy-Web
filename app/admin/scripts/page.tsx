'use client'

import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { supabase } from '@/lib/supabase/client';
import type { Script, ScriptProject } from '@/types/scripts';
import { useEffect, useState } from 'react';
import { ScriptsListClient } from './scripts-list-client';

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [projects, setProjects] = useState<ScriptProject[]>([]);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setTeamId(user.id);

        // Obtener guiones y proyectos
        const [scriptsRes, projectsRes] = await Promise.all([
          supabase
            .from('scripts')
            .select('*')
            .eq('team_id', user.id)
            .order('updated_at', { ascending: false }),
          supabase
            .from('script_projects')
            .select('*')
            .eq('team_id', user.id)
            .order('updated_at', { ascending: false }),
        ]);

        setScripts(scriptsRes.data || []);
        setProjects(projectsRes.data || []);
      } catch (error) {
        console.error('Error loading scripts:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Cargando guiones..." />;
  }

  if (!teamId) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-screen-2xl">
      <ScriptsListClient
        initialScripts={scripts}
        projects={projects}
        teamId={teamId}
      />
    </div>
  );
}
