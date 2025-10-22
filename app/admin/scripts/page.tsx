'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ScriptsListClient } from './scripts-list-client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Script, ScriptProject } from '@/types/scripts';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

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

function ScriptsListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <Card className="p-6">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </Card>
    </div>
  );
}
