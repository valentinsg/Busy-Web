'use client';

// =====================================================
// PANEL DE VERSIONES
// =====================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GitBranch, RotateCcw, Calendar } from 'lucide-react';
import { revertToVersionAction } from '@/app/actions/scripts';
import { toast } from 'sonner';
import type { ScriptVersion } from '@/types/scripts';

interface VersionsPanelProps {
  scriptId: string;
  initialVersions: ScriptVersion[];
  currentVersion: number;
}

export function VersionsPanel({
  scriptId,
  initialVersions,
  currentVersion,
}: VersionsPanelProps) {
  const router = useRouter();
  const [versions] = useState(initialVersions);

  const handleRevert = async (versionId: string, versionNumber: number) => {
    if (
      !confirm(
        `¿Revertir a la versión ${versionNumber}? Esto reemplazará el contenido actual.`
      )
    ) {
      return;
    }

    const result = await revertToVersionAction(scriptId, versionId);
    if (result.success) {
      toast.success(`Revertido a versión ${versionNumber}`);
      router.refresh();
    } else {
      toast.error('Error al revertir');
    }
  };

  if (versions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <GitBranch className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No hay versiones</h3>
        <p className="text-sm text-muted-foreground">
          Creá una versión para guardar un snapshot del guion
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <GitBranch className="w-5 h-5" />
        <h3 className="font-semibold">Historial de Versiones</h3>
        <Badge variant="secondary">{versions.length}</Badge>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-3">
          {versions.map((version) => (
            <Card key={version.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant={
                        version.version === currentVersion ? 'default' : 'secondary'
                      }
                    >
                      v{version.version}
                    </Badge>
                    {version.version === currentVersion && (
                      <span className="text-xs text-muted-foreground">
                        (versión actual)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {new Date(version.created_at).toLocaleString('es-AR')}
                  </div>

                  {version.mdx_frontmatter?.hook && (
                    <p className="text-sm mt-2 text-muted-foreground line-clamp-2">
                      Hook: {version.mdx_frontmatter.hook}
                    </p>
                  )}
                </div>

                {version.version !== currentVersion && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevert(version.id, version.version)}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Revertir
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
