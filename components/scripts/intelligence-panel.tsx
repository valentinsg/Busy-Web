'use client';

// =====================================================
// PANEL DE INTELIGENCIA ÚTIL
// =====================================================

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Lightbulb,
  Wand2,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
} from 'lucide-react';
import type {
  Script,
  ScriptScene,
  ValidationResult,
  PlatformChecklist,
  ScriptTemplate,
} from '@/types/scripts';
import { SCRIPT_TEMPLATES } from '@/lib/scripts/templates';
import { validateScript, getPlatformChecklist } from '@/lib/scripts/validators';

interface IntelligencePanelProps {
  script: Script;
  scenes: ScriptScene[];
  onApplyTemplate: (template: ScriptTemplate) => void;
  onAutogenerateScenes: () => void;
}

export function IntelligencePanel({
  script,
  scenes,
  onApplyTemplate,
  onAutogenerateScenes,
}: IntelligencePanelProps) {
  const validations = validateScript(script, scenes);
  const platformChecklist = script.platform
    ? getPlatformChecklist(script.platform, script, scenes)
    : null;

  const errorCount = validations.filter((v) => v.severity === 'error').length;
  const warningCount = validations.filter((v) => v.severity === 'warning').length;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-accent-brand" />
        <h3 className="font-semibold">Inteligencia Útil</h3>
      </div>

      <Accordion type="multiple" className="space-y-2">
        {/* Plantillas */}
        <AccordionItem value="templates" className="border rounded-lg px-3">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              <span className="text-sm font-medium">Plantillas</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <TemplatesSection onApplyTemplate={onApplyTemplate} />
          </AccordionContent>
        </AccordionItem>

        {/* Autogenerar Escenas */}
        <AccordionItem value="autogenerate" className="border rounded-lg px-3">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              <span className="text-sm font-medium">Autogenerar Escenas</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <AutogenerateSection
              script={script}
              onAutogenerate={onAutogenerateScenes}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Validaciones */}
        <AccordionItem value="validations" className="border rounded-lg px-3">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2 flex-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">Validaciones</span>
              {(errorCount > 0 || warningCount > 0) && (
                <div className="flex items-center gap-1 ml-auto mr-2">
                  {errorCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {errorCount}
                    </Badge>
                  )}
                  {warningCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {warningCount}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ValidationsSection validations={validations} />
          </AccordionContent>
        </AccordionItem>

        {/* Checklist de Plataforma */}
        {platformChecklist && (
          <AccordionItem value="checklist" className="border rounded-lg px-3">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Checklist {script.platform?.toUpperCase()}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ChecklistSection checklist={platformChecklist} />
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </Card>
  );
}

// =====================================================
// TEMPLATES SECTION
// =====================================================

function TemplatesSection({
  onApplyTemplate,
}: {
  onApplyTemplate: (template: ScriptTemplate) => void;
}) {
  const [selectedTemplate, setSelectedTemplate] = useState<ScriptTemplate | null>(null);

  return (
    <div className="space-y-3 pt-2">
      <p className="text-xs text-muted-foreground">
        Aplicá una estructura predefinida para empezar rápido
      </p>

      <div className="space-y-2">
        {SCRIPT_TEMPLATES.map((template) => (
          <Dialog key={template.id}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-left"
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">{template.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {template.description} • {template.est_duration_seconds}s
                  </div>
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>{template.name}</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-4 pr-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {template.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="secondary">{template.category}</Badge>
                      <Badge variant="secondary">{template.platform}</Badge>
                      <Badge variant="secondary">
                        {template.est_duration_seconds}s
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">
                      Escenas ({template.scenes.length})
                    </h4>
                    <div className="space-y-2">
                      {template.scenes.map((scene, idx) => (
                        <Card key={idx} className="p-3">
                          <div className="flex items-start justify-between mb-1">
                            <span className="font-medium text-sm">
                              {scene.heading}
                            </span>
                            {scene.duration_seconds && (
                              <Badge variant="outline" className="text-xs">
                                {scene.duration_seconds}s
                              </Badge>
                            )}
                          </div>
                          {scene.objective && (
                            <p className="text-xs text-muted-foreground">
                              {scene.objective}
                            </p>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => {
                      if (
                        confirm(
                          '¿Aplicar esta plantilla? Esto reemplazará el contenido actual.'
                        )
                      ) {
                        onApplyTemplate(template);
                      }
                    }}
                  >
                    Aplicar Plantilla
                  </Button>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
}

// =====================================================
// AUTOGENERATE SECTION
// =====================================================

function AutogenerateSection({
  script,
  onAutogenerate,
}: {
  script: Script;
  onAutogenerate: () => void;
}) {
  const hasRequiredData =
    script.mdx_frontmatter?.hook &&
    script.mdx_frontmatter?.cta &&
    script.est_duration_seconds;

  return (
    <div className="space-y-3 pt-2">
      <p className="text-xs text-muted-foreground">
        Generá escenas automáticamente basadas en tu hook, CTA y duración objetivo
      </p>

      {!hasRequiredData && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200">
            <p className="font-medium mb-1">Datos faltantes</p>
            <ul className="list-disc list-inside space-y-0.5">
              {!script.mdx_frontmatter?.hook && <li>Hook</li>}
              {!script.mdx_frontmatter?.cta && <li>CTA</li>}
              {!script.est_duration_seconds && <li>Duración estimada</li>}
            </ul>
          </div>
        </div>
      )}

      <Button
        className="w-full"
        onClick={onAutogenerate}
        disabled={!hasRequiredData}
      >
        <Wand2 className="w-4 h-4 mr-2" />
        Generar Escenas
      </Button>

      <p className="text-xs text-muted-foreground">
        Se crearán 4 escenas: Hook (15%), Valor (40%), Prueba (25%), CTA (20%)
      </p>
    </div>
  );
}

// =====================================================
// VALIDATIONS SECTION
// =====================================================

function ValidationsSection({ validations }: { validations: ValidationResult[] }) {
  if (validations.length === 0) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
        <CheckCircle2 className="w-4 h-4 text-green-600" />
        <span className="text-sm text-green-900 dark:text-green-200">
          Todo en orden! ✨
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2 pt-2">
      {validations.map((validation) => (
        <div
          key={validation.id}
          className={`flex items-start gap-2 p-3 rounded-lg ${
            validation.severity === 'error'
              ? 'bg-red-50 dark:bg-red-950/20'
              : validation.severity === 'warning'
              ? 'bg-amber-50 dark:bg-amber-950/20'
              : 'bg-blue-50 dark:bg-blue-950/20'
          }`}
        >
          {validation.severity === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
          ) : validation.severity === 'warning' ? (
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 text-blue-600 mt-0.5" />
          )}
          <span
            className={`text-xs ${
              validation.severity === 'error'
                ? 'text-red-900 dark:text-red-200'
                : validation.severity === 'warning'
                ? 'text-amber-900 dark:text-amber-200'
                : 'text-blue-900 dark:text-blue-200'
            }`}
          >
            {validation.message}
          </span>
        </div>
      ))}
    </div>
  );
}

// =====================================================
// CHECKLIST SECTION
// =====================================================

function ChecklistSection({ checklist }: { checklist: PlatformChecklist }) {
  const completedCount = checklist.items.filter((item) => item.checked).length;
  const totalCount = checklist.items.length;
  const progress = (completedCount / totalCount) * 100;

  return (
    <div className="space-y-4 pt-2">
      {/* Progress */}
      <div>
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-muted-foreground">Progreso</span>
          <span className="font-medium">
            {completedCount}/{totalCount}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-brand transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {checklist.items.map((item) => (
          <div
            key={item.id}
            className={`flex items-start gap-2 p-2 rounded ${
              item.checked
                ? 'bg-green-50 dark:bg-green-950/20'
                : item.required
                ? 'bg-red-50 dark:bg-red-950/20'
                : 'bg-muted'
            }`}
          >
            <CheckCircle2
              className={`w-4 h-4 mt-0.5 ${
                item.checked
                  ? 'text-green-600'
                  : item.required
                  ? 'text-red-600'
                  : 'text-muted-foreground'
              }`}
            />
            <div className="flex-1">
              <span className="text-xs">{item.label}</span>
              {item.required && !item.checked && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  Requerido
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {checklist.recommendations.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold mb-2">Recomendaciones</h4>
          <ul className="space-y-1">
            {checklist.recommendations.map((rec, idx) => (
              <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-accent-brand">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
