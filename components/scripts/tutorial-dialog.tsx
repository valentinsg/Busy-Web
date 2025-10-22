'use client';

// =====================================================
// TUTORIAL INTERACTIVO PASO A PASO
// =====================================================

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Layout,
  Film,
  GitBranch,
  MessageSquare,
  Paperclip,
  Download,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface TutorialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tips: string[];
  image?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: '¡Bienvenido al Módulo de Guiones!',
    description:
      'Este sistema te ayuda a crear, organizar y producir guiones para contenido de video de forma profesional. Vamos a recorrer las funcionalidades principales.',
    icon: <Sparkles className="w-8 h-8 text-accent-brand" />,
    tips: [
      'Diseñado específicamente para contenido de redes sociales',
      'Incluye plantillas para Instagram, TikTok y YouTube',
      'Sistema de validaciones en tiempo real',
    ],
  },
  {
    id: 'create-script',
    title: 'Crear un Guion',
    description:
      'Empezá creando un nuevo guion desde el listado. Podés asignarlo a un proyecto para mantener todo organizado.',
    icon: <FileText className="w-8 h-8 text-blue-600" />,
    tips: [
      'Usá nombres descriptivos: "Ad Remera Negra - IG Reels"',
      'Organizá por proyectos: "Campaña Verano 2025"',
      'El slug se genera automáticamente desde el título',
    ],
  },
  {
    id: 'editor',
    title: 'Editor MDX con Preview',
    description:
      'El editor soporta Markdown con front-matter. Escribí tu guion en el panel izquierdo y mirá el preview en tiempo real a la derecha.',
    icon: <Layout className="w-8 h-8 text-purple-600" />,
    tips: [
      'Front-matter: hook, cta, tone, target_audience, etc.',
      'Autosave cada 2 segundos (no perdés cambios)',
      'Podés cambiar entre vista split, solo editor o solo preview',
    ],
  },
  {
    id: 'metadata',
    title: 'Metadatos del Guion',
    description:
      'Completá los metadatos en la barra superior: estado, categoría, tags, plataforma y duración estimada. Esto alimenta las validaciones.',
    icon: <FileText className="w-8 h-8 text-green-600" />,
    tips: [
      'Estado: idea → outline → draft → review → approved → published',
      'Plataforma: define qué checklist se aplica',
      'Duración estimada: se compara con la suma de escenas',
    ],
  },
  {
    id: 'storyboard',
    title: 'Storyboard con Drag & Drop',
    description:
      'Creá escenas para tu guion. Cada escena tiene: título, objetivo, diálogo, B-roll, duración, tipo de plano, locación y props.',
    icon: <Film className="w-8 h-8 text-red-600" />,
    tips: [
      'Arrastrá las escenas para reordenarlas',
      'La duración total se compara con el objetivo',
      'Editá detalles haciendo clic en el botón de editar',
    ],
  },
  {
    id: 'intelligence',
    title: 'Inteligencia Útil',
    description:
      'El panel lateral incluye plantillas predefinidas, autogeneración de escenas, validaciones en tiempo real y checklist por plataforma.',
    icon: <Sparkles className="w-8 h-8 text-amber-600" />,
    tips: [
      'Plantillas: Ad/UGC, How-to, BTS, Lanzamiento, Testimonial, Trend',
      'Autogenerar: crea 4 escenas desde hook, CTA y duración',
      'Validaciones: te avisa si falta CTA, hook largo, etc.',
    ],
  },
  {
    id: 'versions',
    title: 'Versionado y Revert',
    description:
      'Creá snapshots de tu guion con "Nueva Versión". Podés revertir a cualquier versión anterior desde la pestaña Versiones.',
    icon: <GitBranch className="w-8 h-8 text-indigo-600" />,
    tips: [
      'Cada versión guarda el MDX y front-matter completo',
      'Útil antes de cambios grandes o para comparar iteraciones',
      'El diff te muestra qué cambió entre versiones',
    ],
  },
  {
    id: 'comments',
    title: 'Comentarios y Colaboración',
    description:
      'Dejá comentarios en el guion para feedback del equipo. Podés marcarlos como resueltos cuando se implementen los cambios.',
    icon: <MessageSquare className="w-8 h-8 text-teal-600" />,
    tips: [
      'Ideal para revisiones de copy o dirección',
      'Los comentarios resueltos se colapsan automáticamente',
      'Todos los miembros del team pueden comentar',
    ],
  },
  {
    id: 'assets',
    title: 'Adjuntos (Moodboards, Referencias)',
    description:
      'Subí imágenes, videos o PDFs como referencias. Se guardan en un bucket privado de Supabase.',
    icon: <Paperclip className="w-8 h-8 text-pink-600" />,
    tips: [
      'Moodboards, referencias visuales, storyboards dibujados',
      'Solo el equipo puede ver estos archivos (privado)',
      'Previsualización automática para imágenes',
    ],
  },
  {
    id: 'exports',
    title: 'Exports Rápidos',
    description:
      'Exportá tu guion en 3 formatos: CSV (shotlist), PDF (one-pager) y MDX (archivo de texto).',
    icon: <Download className="w-8 h-8 text-orange-600" />,
    tips: [
      'CSV: para importar en software de edición',
      'PDF: para imprimir y llevar al set',
      'MDX: para backup o compartir con editores de texto',
    ],
  },
];

export function TutorialDialog({ open, onOpenChange }: TutorialDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    onOpenChange(false);
  };

  const step = TUTORIAL_STEPS[currentStep];
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Tutorial Guiones</DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-muted-foreground">
              Paso {currentStep + 1} de {TUTORIAL_STEPS.length}
            </span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-brand transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {/* Icon */}
          <div className="flex justify-center">{step.icon}</div>

          {/* Title & Description */}
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold">{step.title}</h3>
            <p className="text-muted-foreground">{step.description}</p>
          </div>

          {/* Tips */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-brand" />
              Tips
            </h4>
            <ul className="space-y-2">
              {step.tips.map((tip, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-accent-brand font-bold mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-2">
            {TUTORIAL_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStep
                    ? 'w-8 bg-accent-brand'
                    : idx < currentStep
                    ? 'w-2 bg-accent-brand/50'
                    : 'w-2 bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          {currentStep === TUTORIAL_STEPS.length - 1 ? (
            <Button onClick={handleClose}>
              ¡Empezar a Crear!
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Siguiente
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// =====================================================
// TUTORIAL BUTTON (para usar en la UI)
// =====================================================

export function TutorialButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Sparkles className="w-4 h-4 mr-2" />
        Tutorial
      </Button>
      <TutorialDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
