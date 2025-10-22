'use client';

// =====================================================
// LISTADO DE GUIONES (CLIENT)
// =====================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, FolderPlus, FileText, Calendar, Tag } from 'lucide-react';
import { TutorialButton } from '@/components/scripts/tutorial-dialog';
import { createScriptAction, createProjectAction } from '@/app/actions/scripts';
import { toast } from 'sonner';
import type { Script, ScriptProject, ScriptStatus } from '@/types/scripts';

interface ScriptsListClientProps {
  initialScripts: Script[];
  projects: ScriptProject[];
  teamId: string;
}

export function ScriptsListClient({
  initialScripts,
  projects,
  teamId,
}: ScriptsListClientProps) {
  const router = useRouter();
  const [scripts, setScripts] = useState(initialScripts);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ScriptStatus | 'all'>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [isCreatingScript, setIsCreatingScript] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  // Filtrar guiones
  const filteredScripts = scripts.filter((script) => {
    const matchesSearch =
      searchQuery === '' ||
      script.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      script.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || script.status === statusFilter;
    const matchesProject =
      projectFilter === 'all' || script.project_id === projectFilter;

    return matchesSearch && matchesStatus && matchesProject;
  });

  // Agrupar por estado
  const scriptsByStatus = filteredScripts.reduce((acc, script) => {
    if (!acc[script.status]) acc[script.status] = [];
    acc[script.status].push(script);
    return acc;
  }, {} as Record<string, Script[]>);

  const handleCreateScript = async (title: string, projectId?: string) => {
    setIsCreatingScript(true);
    const result = await createScriptAction(teamId, title, projectId);
    setIsCreatingScript(false);

    if (result.success && result.data) {
      toast.success('Guion creado');
      router.push(`/admin/scripts/${result.data.id}`);
    } else {
      toast.error(result.error || 'Error al crear guion');
    }
  };

  const handleCreateProject = async (name: string, description?: string) => {
    setIsCreatingProject(true);
    const result = await createProjectAction(teamId, name, description);
    setIsCreatingProject(false);

    if (result.success) {
      toast.success('Proyecto creado');
      router.refresh();
    } else {
      toast.error(result.error || 'Error al crear proyecto');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Guiones</h1>
          <p className="text-muted-foreground">
            Creá y gestioná guiones para contenido de video
          </p>
        </div>

        <div className="flex items-center gap-2">
          <TutorialButton />
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FolderPlus className="w-4 h-4 mr-2" />
                Nuevo Proyecto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Proyecto</DialogTitle>
              </DialogHeader>
              <CreateProjectForm
                onSubmit={handleCreateProject}
                isLoading={isCreatingProject}
              />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Guion
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Guion</DialogTitle>
              </DialogHeader>
              <CreateScriptForm
                projects={projects}
                onSubmit={handleCreateScript}
                isLoading={isCreatingScript}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar guiones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="idea">Idea</SelectItem>
              <SelectItem value="outline">Outline</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>

          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Proyecto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los proyectos</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Scripts List */}
      {filteredScripts.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No hay guiones</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || statusFilter !== 'all' || projectFilter !== 'all'
              ? 'No se encontraron guiones con estos filtros'
              : 'Creá tu primer guion para empezar'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(scriptsByStatus).map(([status, statusScripts]) => (
            <div key={status}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold capitalize">{status}</h3>
                <Badge variant="secondary">{statusScripts.length}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {statusScripts.map((script) => (
                  <ScriptCard
                    key={script.id}
                    script={script}
                    project={projects.find((p) => p.id === script.project_id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =====================================================
// SCRIPT CARD
// =====================================================

function ScriptCard({
  script,
  project,
}: {
  script: Script;
  project?: ScriptProject;
}) {
  return (
    <Link href={`/admin/scripts/${script.id}`}>
      <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold line-clamp-2 mb-1">{script.title}</h4>
            {project && (
              <p className="text-xs text-muted-foreground">{project.name}</p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {script.platform && (
              <Badge variant="outline" className="text-xs">
                {script.platform}
              </Badge>
            )}
            {script.category && (
              <Badge variant="secondary" className="text-xs">
                {script.category}
              </Badge>
            )}
            {script.est_duration_seconds && (
              <Badge variant="secondary" className="text-xs">
                {script.est_duration_seconds}s
              </Badge>
            )}
          </div>

          {script.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <Tag className="w-3 h-3 text-muted-foreground" />
              {script.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs text-muted-foreground">
                  {tag}
                </span>
              ))}
              {script.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{script.tags.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <Calendar className="w-3 h-3" />
            {new Date(script.updated_at).toLocaleDateString('es-AR')}
          </div>
        </div>
      </Card>
    </Link>
  );
}

// =====================================================
// CREATE SCRIPT FORM
// =====================================================

function CreateScriptForm({
  projects,
  onSubmit,
  isLoading,
}: {
  projects: ScriptProject[];
  onSubmit: (title: string, projectId?: string) => void;
  isLoading: boolean;
}) {
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState<string>('none');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim(), projectId === 'none' ? undefined : projectId);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Título del Guion *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Ad Remera Negra - IG Reels"
          required
        />
      </div>

      <div>
        <Label htmlFor="project">Proyecto (opcional)</Label>
        <Select value={projectId} onValueChange={setProjectId}>
          <SelectTrigger id="project">
            <SelectValue placeholder="Sin proyecto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sin proyecto</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creando...' : 'Crear Guion'}
      </Button>
    </form>
  );
}

// =====================================================
// CREATE PROJECT FORM
// =====================================================

function CreateProjectForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (name: string, description?: string) => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim(), description.trim() || undefined);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre del Proyecto *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Campaña Verano 2025"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Breve descripción del proyecto"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creando...' : 'Crear Proyecto'}
      </Button>
    </form>
  );
}
