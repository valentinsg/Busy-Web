'use client';

// =====================================================
// EDITOR DE GUIONES (CLIENT)
// =====================================================

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Save,
  GitBranch,
  Download,
  Loader2,
} from 'lucide-react';
import { MDXEditor } from '@/components/scripts/mdx-editor';
import { Storyboard } from '@/components/scripts/storyboard';
import { IntelligencePanel } from '@/components/scripts/intelligence-panel';
import { VersionsPanel } from './versions-panel';
import { CommentsPanel } from './comments-panel';
import { AssetsPanel } from './assets-panel';
import {
  updateScriptAction,
  createSceneAction,
  updateSceneAction,
  deleteSceneAction,
  reorderScenesAction,
  bulkCreateScenesAction,
  createVersionAction,
} from '@/app/actions/scripts';
import {
  exportShotlistCSV,
  downloadCSV,
  exportMDX,
  downloadMDX,
  generatePDFHTML,
  printPDF,
} from '@/lib/scripts/exports';
import { autogenerateScenes } from '@/lib/scripts/validators';
import { toast } from 'sonner';
import matter from 'gray-matter';
import type {
  Script,
  ScriptScene,
  ScriptVersion,
  ScriptComment,
  ScriptAsset,
  ScriptProject,
  ScriptStatus,
  ScriptPlatform,
  ScriptTemplate,
} from '@/types/scripts';

interface ScriptEditorClientProps {
  script: Script;
  initialScenes: ScriptScene[];
  initialVersions: ScriptVersion[];
  initialComments: ScriptComment[];
  initialAssets: ScriptAsset[];
  projects: ScriptProject[];
  teamId: string;
}

export function ScriptEditorClient({
  script: initialScript,
  initialScenes,
  initialVersions,
  initialComments,
  initialAssets,
  projects,
  teamId,
}: ScriptEditorClientProps) {
  const router = useRouter();
  const [script, setScript] = useState(initialScript);
  const [scenes, setScenes] = useState(initialScenes);
  const [mdxContent, setMdxContent] = useState(script.mdx);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());

  // Auto-save MDX
  const handleMDXChange = useCallback(
    async (value: string) => {
      setMdxContent(value);
      
      // Parsear front-matter
      try {
        const parsed = matter(value);
        
        setIsSaving(true);
        const result = await updateScriptAction(script.id, {
          mdx: value,
          mdx_frontmatter: parsed.data,
        });
        setIsSaving(false);

        if (result.success && result.data) {
          setScript(result.data);
          setLastSaved(new Date());
        }
      } catch (error) {
        console.error('Error saving MDX:', error);
      }
    },
    [script.id]
  );

  // Actualizar metadatos
  const handleMetadataUpdate = async (updates: Partial<Script>) => {
    const result = await updateScriptAction(script.id, updates);
    if (result.success && result.data) {
      setScript(result.data);
      toast.success('Guardado');
    } else {
      toast.error('Error al guardar');
    }
  };

  // Escenas
  const handleSceneAdd = async () => {
    const newIdx = scenes.length;
    const result = await createSceneAction(script.id, {
      idx: newIdx,
      heading: `Escena ${newIdx + 1}`,
      objective: '',
      duration_seconds: 5,
    });

    if (result.success && result.data) {
      setScenes([...scenes, result.data]);
      toast.success('Escena agregada');
    }
  };

  const handleSceneUpdate = async (id: string, updates: Partial<ScriptScene>) => {
    const result = await updateSceneAction(id, script.id, updates);
    if (result.success && result.data) {
      setScenes(scenes.map((s) => (s.id === id ? result.data! : s)));
      toast.success('Escena actualizada');
    }
  };

  const handleSceneDelete = async (id: string) => {
    const result = await deleteSceneAction(id, script.id);
    if (result.success) {
      setScenes(scenes.filter((s) => s.id !== id));
      toast.success('Escena eliminada');
    }
  };

  const handleScenesReorder = async (reordered: ScriptScene[]) => {
    setScenes(reordered);
    const result = await reorderScenesAction(
      script.id,
      reordered.map((s) => s.id)
    );
    if (!result.success) {
      toast.error('Error al reordenar');
    }
  };

  // Plantillas
  const handleApplyTemplate = async (template: ScriptTemplate) => {
    // Actualizar MDX y front-matter
    await handleMetadataUpdate({
      mdx: template.mdx,
      mdx_frontmatter: template.frontmatter,
      category: template.category,
      platform: template.platform,
      est_duration_seconds: template.est_duration_seconds,
    });

    // Crear escenas
    const result = await bulkCreateScenesAction(script.id, template.scenes);
    if (result.success && result.data) {
      setScenes(result.data);
      toast.success('Plantilla aplicada');
    }
  };

  // Autogenerar escenas
  const handleAutogenerateScenes = async () => {
    const hook = script.mdx_frontmatter?.hook || '';
    const cta = script.mdx_frontmatter?.cta || '';
    const duration = script.est_duration_seconds || 30;

    const generatedScenes = autogenerateScenes(hook, cta, duration);
    const result = await bulkCreateScenesAction(script.id, generatedScenes);

    if (result.success && result.data) {
      setScenes(result.data);
      toast.success('Escenas generadas');
    }
  };

  // Nueva versión
  const handleCreateVersion = async () => {
    if (!confirm('¿Crear una nueva versión? Esto guardará un snapshot del estado actual.')) {
      return;
    }

    const result = await createVersionAction(
      script.id,
      script.mdx,
      script.mdx_frontmatter
    );

    if (result.success) {
      toast.success(`Versión ${script.version + 1} creada`);
      router.refresh();
    } else {
      toast.error('Error al crear versión');
    }
  };

  // Exports
  const handleExportCSV = () => {
    const csv = exportShotlistCSV(scenes);
    downloadCSV(csv, `${script.slug}-shotlist.csv`);
    toast.success('CSV descargado');
  };

  const handleExportMDX = () => {
    const mdx = exportMDX(script);
    downloadMDX(mdx, `${script.slug}.mdx`);
    toast.success('MDX descargado');
  };

  const handleExportPDF = () => {
    const html = generatePDFHTML(script, scenes);
    printPDF(html);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Top Bar */}
      <div className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Link href="/admin/scripts">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>

              <div className="flex-1 min-w-0">
                <Input
                  value={script.title}
                  onChange={(e) => handleMetadataUpdate({ title: e.target.value })}
                  className="font-semibold text-lg border-0 px-2 focus-visible:ring-0"
                />
              </div>

              {isSaving ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  Guardado {lastSaved.toLocaleTimeString('es-AR')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCreateVersion}>
                <GitBranch className="w-4 h-4 mr-2" />
                Nueva Versión
              </Button>

              <Select
                value="export"
                onValueChange={(value) => {
                  if (value === 'csv') handleExportCSV();
                  if (value === 'mdx') handleExportMDX();
                  if (value === 'pdf') handleExportPDF();
                }}
              >
                <SelectTrigger className="w-32">
                  <Download className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Export" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV Shotlist</SelectItem>
                  <SelectItem value="pdf">PDF One-Pager</SelectItem>
                  <SelectItem value="mdx">MDX File</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Metadata Row */}
          <div className="flex items-center gap-3 mt-3">
            <Select
              value={script.status}
              onValueChange={(value: ScriptStatus) =>
                handleMetadataUpdate({ status: value })
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="idea">Idea</SelectItem>
                <SelectItem value="outline">Outline</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Categoría"
              value={script.category || ''}
              onChange={(e) => handleMetadataUpdate({ category: e.target.value })}
              className="w-40"
            />

            <Select
              value={script.platform || ''}
              onValueChange={(value: ScriptPlatform) =>
                handleMetadataUpdate({ platform: value })
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Plataforma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Duración (s)"
              value={script.est_duration_seconds || ''}
              onChange={(e) =>
                handleMetadataUpdate({
                  est_duration_seconds: parseInt(e.target.value) || undefined,
                })
              }
              className="w-32"
            />

            <Input
              placeholder="Tags (separados por coma)"
              value={script.tags.join(', ')}
              onChange={(e) =>
                handleMetadataUpdate({
                  tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                })
              }
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-4 p-4">
          {/* Left: Editor + Storyboard */}
          <div className="flex flex-col gap-4 overflow-hidden">
            <Tabs defaultValue="editor" className="flex-1 flex flex-col overflow-hidden">
              <TabsList>
                <TabsTrigger value="editor">Editor MDX</TabsTrigger>
                <TabsTrigger value="storyboard">Storyboard</TabsTrigger>
                <TabsTrigger value="versions">Versiones</TabsTrigger>
                <TabsTrigger value="comments">Comentarios</TabsTrigger>
                <TabsTrigger value="assets">Adjuntos</TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="flex-1 mt-4 overflow-hidden">
                <MDXEditor
                  value={mdxContent}
                  onChange={handleMDXChange}
                  autoSave={true}
                  autoSaveDelay={2000}
                />
              </TabsContent>

              <TabsContent value="storyboard" className="flex-1 mt-4 overflow-auto">
                <Storyboard
                  scenes={scenes}
                  onScenesChange={handleScenesReorder}
                  onSceneUpdate={handleSceneUpdate}
                  onSceneDelete={handleSceneDelete}
                  onSceneAdd={handleSceneAdd}
                  targetDuration={script.est_duration_seconds}
                />
              </TabsContent>

              <TabsContent value="versions" className="flex-1 mt-4 overflow-auto">
                <VersionsPanel
                  scriptId={script.id}
                  initialVersions={initialVersions}
                  currentVersion={script.version}
                />
              </TabsContent>

              <TabsContent value="comments" className="flex-1 mt-4 overflow-auto">
                <CommentsPanel
                  scriptId={script.id}
                  initialComments={initialComments}
                />
              </TabsContent>

              <TabsContent value="assets" className="flex-1 mt-4 overflow-auto">
                <AssetsPanel
                  scriptId={script.id}
                  initialAssets={initialAssets}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Intelligence Panel */}
          <div className="overflow-auto">
            <IntelligencePanel
              script={script}
              scenes={scenes}
              onApplyTemplate={handleApplyTemplate}
              onAutogenerateScenes={handleAutogenerateScenes}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
