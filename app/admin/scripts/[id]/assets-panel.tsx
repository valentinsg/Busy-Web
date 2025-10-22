'use client';

// =====================================================
// PANEL DE ADJUNTOS
// =====================================================

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Paperclip, Upload, Trash2, File, Image as ImageIcon, Calendar } from 'lucide-react';
import { createAssetAction, deleteAssetAction } from '@/app/actions/scripts';
import { uploadAssetFile } from '@/lib/repo/scripts';
import { toast } from 'sonner';
import type { ScriptAsset } from '@/types/scripts';

interface AssetsPanelProps {
  scriptId: string;
  initialAssets: ScriptAsset[];
}

export function AssetsPanel({
  scriptId,
  initialAssets,
}: AssetsPanelProps) {
  const router = useRouter();
  const [assets, setAssets] = useState(initialAssets);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    for (const file of Array.from(files)) {
      try {
        // Upload to Supabase Storage
        const url = await uploadAssetFile(file, scriptId);

        // Determine kind
        let kind = 'other';
        if (file.type.startsWith('image/')) kind = 'image';
        else if (file.type.startsWith('video/')) kind = 'video';
        else if (file.type === 'application/pdf') kind = 'pdf';

        // Create asset record
        const result = await createAssetAction(
          scriptId,
          file.name,
          url,
          kind,
          file.size
        );

        if (result.success && result.data) {
          setAssets([...assets, result.data]);
          toast.success(`${file.name} subido`);
        }
      } catch (error) {
        toast.error(`Error al subir ${file.name}`);
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar ${name}?`)) return;

    const result = await deleteAssetAction(id, scriptId);
    if (result.success) {
      setAssets(assets.filter((a) => a.id !== id));
      toast.success('Adjunto eliminado');
    } else {
      toast.error('Error al eliminar');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="w-5 h-5" />
          <h3 className="font-semibold">Adjuntos</h3>
          <Badge variant="secondary">{assets.length}</Badge>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload className="w-4 h-4 mr-2" />
          {isUploading ? 'Subiendo...' : 'Subir'}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,video/*,.pdf"
        />
      </div>

      <ScrollArea className="h-[500px]">
        <div className="space-y-3">
          {assets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onDelete={handleDelete}
            />
          ))}

          {assets.length === 0 && (
            <Card className="p-8 text-center">
              <Paperclip className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                No hay adjuntos todavía
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Subir Archivo
              </Button>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// =====================================================
// ASSET CARD
// =====================================================

function AssetCard({
  asset,
  onDelete,
}: {
  asset: ScriptAsset;
  onDelete: (id: string, name: string) => void;
}) {
  const isImage = asset.kind === 'image';

  return (
    <Card className="p-3">
      <div className="flex items-start gap-3">
        {/* Preview */}
        <div className="w-16 h-16 rounded bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
          {isImage ? (
            <img
              src={asset.url}
              alt={asset.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <File className="w-8 h-8 text-muted-foreground" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium truncate">{asset.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {asset.kind}
            </Badge>
            {asset.size_bytes && (
              <span className="text-xs text-muted-foreground">
                {formatBytes(asset.size_bytes)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <Calendar className="w-3 h-3" />
            {new Date(asset.created_at).toLocaleDateString('es-AR')}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(asset.url, '_blank')}
          >
            Ver
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(asset.id, asset.name)}
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

// =====================================================
// UTILS
// =====================================================

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
