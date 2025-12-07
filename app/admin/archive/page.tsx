'use client';

import { AdminGuard } from '@/components/admin/admin-guard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Camera, HelpCircle, ImagePlus, Plus, Trash2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';

type ArchiveItemForm = {
  id: number;
  file: File | null;
  previewUrl: string | null;
  title: string;
  microcopy: string;
  mood: string;
  tags: string;
  place: string;
  person: string;
};

const EMPTY_ITEM: ArchiveItemForm = {
  id: 0,
  file: null,
  previewUrl: null,
  title: '',
  microcopy: '',
  mood: '',
  tags: '',
  place: '',
  person: '',
};

export default function AdminArchivePage() {
  return (
    <AdminGuard>
      <ArchiveUploader />
    </AdminGuard>
  );
}

function ArchiveUploader() {
  const [items, setItems] = useState<ArchiveItemForm[]>([
    { ...EMPTY_ITEM, id: 1 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFieldTips, setShowFieldTips] = useState(false);
  const [expandedItem, setExpandedItem] = useState<number | null>(1); // Para móvil: solo un item expandido
  const { toast } = useToast();
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const cameraInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const handleFileChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              file,
              previewUrl: file ? URL.createObjectURL(file) : null,
            }
          : item
      )
    );
    setError(null);
  };

  const handleFieldChange = (index: number, field: keyof Omit<ArchiveItemForm, 'id' | 'file' | 'previewUrl'>, value: string) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const handleAddItem = () => {
    setItems((prev) => {
      if (prev.length >= 5) return prev;
      const nextId = Math.max(...prev.map((i) => i.id)) + 1;
      return [...prev, { ...EMPTY_ITEM, id: nextId }];
    });
  };

  const handleRemoveItem = (id: number) => {
    setItems((prev) => {
      if (prev.length === 1) return prev;
      const filtered = prev.filter((item) => item.id !== id);
      // Si el item expandido fue eliminado, expandir el primero
      if (expandedItem === id && filtered.length > 0) {
        setExpandedItem(filtered[0].id);
      }
      return filtered;
    });
  };

  const clearImage = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, file: null, previewUrl: null }
          : item
      )
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const toUpload = items.filter((item) => item.file);

    if (!toUpload.length) {
      setError('Agregá al menos una imagen con sus datos para subir al Archive.');
      return;
    }

    try {
      setIsSubmitting(true);
      let uploadedCount = 0;

      for (const item of toUpload) {
        const formData = new FormData();
        formData.append('file', item.file as File);
        if (item.title) formData.append('title', item.title);
        if (item.microcopy) formData.append('microcopy', item.microcopy);
        if (item.mood) formData.append('mood', item.mood);
        if (item.tags) formData.append('tags', item.tags);
        if (item.place) formData.append('place', item.place);
        if (item.person) formData.append('person', item.person);

        const res = await fetch('/api/archive/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'No se pudo subir una de las entradas al archivo.');
        }

        uploadedCount += 1;
      }

      toast({
        title: '&#10004; Subida completa',
        description: `${uploadedCount} entr${uploadedCount === 1 ? 'ada' : 'adas'} al Busy Archive.`,
      });
      setItems([{ ...EMPTY_ITEM, id: 1 }]);
      setExpandedItem(1);
    } catch (error: unknown) {
      console.error(error);
      setError('Ocurrió un error al subir las imágenes. Por favor, intentá de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-3 py-4 font-body sm:px-4 sm:py-6">
      {/* Header - Compacto en móvil */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-heading font-semibold tracking-tight sm:text-2xl">
              Busy Archive
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              Subí fotos al archivo. Se optimizan automáticamente.
            </p>
          </div>
          <TooltipProvider delayDuration={80} skipDelayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setShowFieldTips((prev) => !prev)}
                  className="shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-full border border-border/60 bg-card/80 text-muted-foreground hover:text-foreground hover:border-foreground/70 hover:bg-card transition sm:h-auto sm:w-auto sm:px-2.5 sm:py-1 sm:gap-1"
                  aria-label="Tips"
                >
                  <HelpCircle className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                  <span className="hidden sm:inline text-[11px]">Tips</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs text-xs font-body">
                <p className="mb-1 font-semibold text-foreground">Tips para subir</p>
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                  <li>Microcopy corta y honesta.</li>
                  <li>2–3 moods: "noche, calle, torneo".</li>
                  <li>Tags para filtrar: "ss24-drop1".</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {/* Items - Accordion en móvil, grid en desktop */}
        <div className="space-y-3">
          {items.map((item, index) => {
            const isExpanded = expandedItem === item.id;
            const hasImage = Boolean(item.previewUrl);

            return (
              <div
                key={item.id}
                className="rounded-xl border bg-card overflow-hidden"
              >
                {/* Header del item - clickeable en móvil */}
                <button
                  type="button"
                  onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/30 transition sm:hidden"
                >
                  {/* Thumbnail mini */}
                  <div className="relative h-12 w-12 shrink-0 rounded-lg bg-muted/60 overflow-hidden">
                    {hasImage ? (
                      <Image
                        src={item.previewUrl!}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImagePlus className="h-5 w-5 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.title || item.microcopy || `Imagen ${index + 1}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {hasImage ? 'Imagen lista' : 'Sin imagen'}
                      {item.mood && ` · ${item.mood.split(',')[0]}`}
                    </p>
                  </div>
                  <div className="text-muted-foreground">
                    <svg
                      className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Contenido expandible en móvil, siempre visible en desktop */}
                <div className={`${isExpanded ? 'block' : 'hidden'} sm:block`}>
                  {/* Header desktop */}
                  <div className="hidden sm:flex items-center justify-between gap-2 p-4 pb-0">
                    <p className="text-xs font-semibold font-heading text-muted-foreground uppercase tracking-wide">
                      Imagen {index + 1}
                    </p>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-red-500/40 bg-red-500/5 px-2 py-0.5 text-[11px] font-body text-red-400 hover:bg-red-500/10 hover:border-red-500/70 transition"
                      >
                        <Trash2 className="h-3 w-3" /> Quitar
                      </button>
                    )}
                  </div>

                  <div className="p-3 pt-0 sm:p-4 space-y-4">
                    {/* Zona de imagen - Mobile first con botones grandes */}
                    <div className="space-y-2">
                      {item.previewUrl ? (
                        <div className="relative">
                          <div className="aspect-[4/5] w-full overflow-hidden rounded-xl bg-muted/60">
                            <Image
                              src={item.previewUrl}
                              alt="Preview"
                              width={800}
                              height={1000}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          {/* Botón para quitar imagen */}
                          <button
                            type="button"
                            onClick={() => clearImage(index)}
                            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
                          {/* Input oculto para galería */}
                          <input
                            ref={(el) => { fileInputRefs.current[item.id] = el; }}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(index, e)}
                            className="hidden"
                          />
                          {/* Input oculto para cámara */}
                          <input
                            ref={(el) => { cameraInputRefs.current[item.id] = el; }}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => handleFileChange(index, e)}
                            className="hidden"
                          />

                          {/* Botón Cámara - Grande en móvil */}
                          <button
                            type="button"
                            onClick={() => cameraInputRefs.current[item.id]?.click()}
                            className="flex flex-col items-center justify-center gap-2 aspect-square rounded-xl border-2 border-dashed border-border/60 bg-muted/30 hover:bg-muted/50 hover:border-foreground/30 transition active:scale-95"
                          >
                            <Camera className="h-8 w-8 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">Cámara</span>
                          </button>

                          {/* Botón Galería - Grande en móvil */}
                          <button
                            type="button"
                            onClick={() => fileInputRefs.current[item.id]?.click()}
                            className="flex flex-col items-center justify-center gap-2 aspect-square rounded-xl border-2 border-dashed border-border/60 bg-muted/30 hover:bg-muted/50 hover:border-foreground/30 transition active:scale-95"
                          >
                            <ImagePlus className="h-8 w-8 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">Galería</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Campos del formulario - Stack vertical en móvil */}
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Título</Label>
                        <Input
                          value={item.title}
                          onChange={(e) => handleFieldChange(index, 'title', e.target.value)}
                          placeholder="Nombre de la imagen"
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Descripción</Label>
                        <Textarea
                          value={item.microcopy}
                          onChange={(e) => handleFieldChange(index, 'microcopy', e.target.value)}
                          placeholder="Una línea que capture el momento."
                          rows={2}
                          className="resize-none"
                        />
                        {showFieldTips && (
                          <p className="text-[10px] text-muted-foreground">
                            Ej: &quot;Noche de pickup en la Bristol&quot;
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Mood</Label>
                          <Input
                            value={item.mood}
                            onChange={(e) => handleFieldChange(index, 'mood', e.target.value)}
                            placeholder="noche, calle"
                            className="h-11"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Tags</Label>
                          <Input
                            value={item.tags}
                            onChange={(e) => handleFieldChange(index, 'tags', e.target.value)}
                            placeholder="drop, evento"
                            className="h-11"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Lugar</Label>
                          <Input
                            value={item.place}
                            onChange={(e) => handleFieldChange(index, 'place', e.target.value)}
                            placeholder="Mar del Plata"
                            className="h-11"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Persona</Label>
                          <Input
                            value={item.person}
                            onChange={(e) => handleFieldChange(index, 'person', e.target.value)}
                            placeholder="Nombre"
                            className="h-11"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Botón quitar en móvil */}
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-red-400 hover:text-red-300 transition sm:hidden"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Quitar esta imagen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Botón agregar imagen */}
        {items.length < 5 && (
          <button
            type="button"
            onClick={handleAddItem}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border/60 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/40 transition active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" /> Agregar otra imagen
          </button>
        )}

        {error && <p className="text-sm text-destructive text-center">{error}</p>}

        {/* Botón submit - Sticky en móvil */}
        <div className="sticky bottom-0 -mx-3 px-3 py-3 bg-background/95 backdrop-blur-sm border-t sm:relative sm:mx-0 sm:px-0 sm:py-0 sm:bg-transparent sm:border-0">
          <Button
            type="submit"
            disabled={isSubmitting || !items.some((i) => i.file)}
            className="w-full h-12 text-base font-body gap-2 sm:w-auto sm:h-10 sm:text-sm"
          >
            <Upload className="h-4 w-4" />
            {isSubmitting
              ? `Subiendo${items.filter((i) => i.file).length > 1 ? ` ${items.filter((i) => i.file).length} imágenes…` : '…'}`
              : `Subir al Archive${items.filter((i) => i.file).length > 1 ? ` (${items.filter((i) => i.file).length})` : ''}`}
          </Button>
        </div>
      </form>
    </div>
  );
}
