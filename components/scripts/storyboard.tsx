'use client';

// =====================================================
// STORYBOARD CON DRAG & DROP
// =====================================================

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { GripVertical, Trash2, Edit, Plus } from 'lucide-react';
import type { ScriptScene, ShotType } from '@/types/scripts';

interface StoryboardProps {
  scenes: ScriptScene[];
  onScenesChange: (scenes: ScriptScene[]) => void;
  onSceneUpdate: (id: string, updates: Partial<ScriptScene>) => void;
  onSceneDelete: (id: string) => void;
  onSceneAdd: () => void;
  targetDuration?: number;
}

export function Storyboard({
  scenes,
  onScenesChange,
  onSceneUpdate,
  onSceneDelete,
  onSceneAdd,
  targetDuration,
}: StoryboardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = scenes.findIndex((s) => s.id === active.id);
      const newIndex = scenes.findIndex((s) => s.id === over.id);

      const reordered = arrayMove(scenes, oldIndex, newIndex).map((scene, idx) => ({
        ...scene,
        idx,
      }));

      onScenesChange(reordered);
    }
  };

  const totalDuration = scenes.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
  const deviation = targetDuration ? Math.abs(totalDuration - targetDuration) / targetDuration : 0;
  
  let statusColor = 'text-green-600';
  if (deviation > 0.1) statusColor = 'text-amber-600';
  if (deviation > 0.2) statusColor = 'text-red-600';

  return (
    <div className="space-y-4">
      {/* Header con totales */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Storyboard</h3>
          <span className="text-sm text-muted-foreground">
            {scenes.length} escena{scenes.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`text-sm font-medium ${statusColor}`}>
            {totalDuration}s
            {targetDuration && (
              <span className="text-muted-foreground">
                {' '}/ {targetDuration}s
              </span>
            )}
          </div>
          
          <Button onClick={onSceneAdd} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Escena
          </Button>
        </div>
      </div>

      {/* Lista de escenas con drag & drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={scenes.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {scenes.map((scene) => (
              <SceneCard
                key={scene.id}
                scene={scene}
                onUpdate={onSceneUpdate}
                onDelete={onSceneDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {scenes.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">
            No hay escenas todavía. Agregá la primera escena para empezar.
          </p>
          <Button onClick={onSceneAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar Primera Escena
          </Button>
        </Card>
      )}
    </div>
  );
}

// =====================================================
// SCENE CARD (SORTABLE)
// =====================================================

interface SceneCardProps {
  scene: ScriptScene;
  onUpdate: (id: string, updates: Partial<ScriptScene>) => void;
  onDelete: (id: string) => void;
}

function SceneCard({ scene, onUpdate, onDelete }: SceneCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scene.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="p-4">
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <button
          className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Escena {scene.idx + 1}
                </span>
                {scene.duration_seconds && (
                  <span className="text-xs px-2 py-0.5 bg-black text-white rounded">
                    {scene.duration_seconds}s
                  </span>
                )}
              </div>
              <h4 className="font-semibold text-sm">{scene.heading}</h4>
              {scene.objective && (
                <p className="text-sm text-muted-foreground mt-1 italic">
                  {scene.objective}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Editar Escena {scene.idx + 1}</DialogTitle>
                  </DialogHeader>
                  <SceneEditForm
                    scene={scene}
                    onSave={(updates) => {
                      onUpdate(scene.id, updates);
                      setIsEditOpen(false);
                    }}
                    onCancel={() => setIsEditOpen(false)}
                  />
                </DialogContent>
              </Dialog>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm('¿Eliminar esta escena?')) {
                    onDelete(scene.id);
                  }
                }}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          </div>

          {/* Metadata compacta */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
            {scene.shot_type && (
              <span className="capitalize">{scene.shot_type}</span>
            )}
            {scene.location && <span>📍 {scene.location}</span>}
          </div>
        </div>
      </div>
    </Card>
  );
}

// =====================================================
// SCENE EDIT FORM
// =====================================================

interface SceneEditFormProps {
  scene: ScriptScene;
  onSave: (updates: Partial<ScriptScene>) => void;
  onCancel: () => void;
}

function SceneEditForm({ scene, onSave, onCancel }: SceneEditFormProps) {
  const [formData, setFormData] = useState({
    heading: scene.heading,
    objective: scene.objective || '',
    dialogue_mdx: scene.dialogue_mdx || '',
    broll_notes: scene.broll_notes || '',
    duration_seconds: scene.duration_seconds || 0,
    shot_type: scene.shot_type || '',
    location: scene.location || '',
    props: scene.props || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const shotTypes: ShotType[] = [
    'wide',
    'medium',
    'close-up',
    'detail',
    'pov',
    'over-shoulder',
    'aerial',
    'other',
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="heading">Título de la Escena *</Label>
        <Input
          id="heading"
          value={formData.heading}
          onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="objective">Objetivo</Label>
        <Input
          id="objective"
          value={formData.objective}
          onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
          placeholder="¿Qué debe lograr esta escena?"
        />
      </div>

      <div>
        <Label htmlFor="dialogue">Diálogo / VO (Markdown)</Label>
        <Textarea
          id="dialogue"
          value={formData.dialogue_mdx}
          onChange={(e) => setFormData({ ...formData, dialogue_mdx: e.target.value })}
          rows={4}
          placeholder="Texto del voiceover o diálogo..."
        />
      </div>

      <div>
        <Label htmlFor="broll">Notas de B-Roll</Label>
        <Textarea
          id="broll"
          value={formData.broll_notes}
          onChange={(e) => setFormData({ ...formData, broll_notes: e.target.value })}
          rows={3}
          placeholder="Imágenes de apoyo, overlays, etc."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="duration">Duración (segundos)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration_seconds}
            onChange={(e) =>
              setFormData({ ...formData, duration_seconds: parseInt(e.target.value) || 0 })
            }
            min={0}
          />
        </div>

        <div>
          <Label htmlFor="shot_type">Tipo de Plano</Label>
          <Select
            value={formData.shot_type}
            onValueChange={(value) => setFormData({ ...formData, shot_type: value })}
          >
            <SelectTrigger id="shot_type">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {shotTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="location">Locación</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Interior, exterior, estudio..."
          />
        </div>

        <div>
          <Label htmlFor="props">Props</Label>
          <Input
            id="props"
            value={formData.props}
            onChange={(e) => setFormData({ ...formData, props: e.target.value })}
            placeholder="Objetos necesarios..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
