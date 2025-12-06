'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { ArchiveEntry } from '@/types/archive';
import {
    Download,
    ExternalLink,
    Link2,
    MoreHorizontal,
    Share2,
} from 'lucide-react';
import { useCallback, useState } from 'react';

interface ArchiveItemMenuProps {
  entry: ArchiveEntry;
  className?: string;
}

export function ArchiveItemMenu({ entry, className }: ArchiveItemMenuProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  // Use correct domain
  const shareUrl = `https://busy.com.ar/archive/${entry.id}`;
  const shareTitle = entry.microcopy || 'Busy Archive';

  // Copy link to clipboard
  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Link copiado',
        description: 'El link fue copiado al portapapeles.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo copiar el link.',
        variant: 'destructive',
      });
    }
    setOpen(false);
  }, [shareUrl, toast]);

  // Native share (mobile)
  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `Mirá esto en Busy Archive`,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error
        if ((err as Error).name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
    setOpen(false);
  }, [shareTitle, shareUrl, handleCopyLink]);

  // Download image
  const handleDownload = useCallback(async () => {
    try {
      const response = await fetch(entry.full_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `busy-archive-${entry.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: 'Descargando...',
        description: 'La imagen se está descargando.',
      });
    } catch {
      // Fallback: open in new tab
      window.open(entry.full_url, '_blank');
    }
    setOpen(false);
  }, [entry.full_url, entry.id, toast]);

  // Open in new tab
  const handleOpenNew = useCallback(() => {
    window.open(`/archive/${entry.id}`, '_blank');
    setOpen(false);
  }, [entry.id]);


  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className={`h-8 w-8 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm ${className}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <MoreHorizontal className="h-4 w-4 text-white" />
          <span className="sr-only">Opciones</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={4}
        className="w-48 font-body z-50"
        onClick={(e) => e.stopPropagation()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
          <Share2 className="mr-2 h-4 w-4" />
          Compartir
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
          <Link2 className="mr-2 h-4 w-4" />
          Copiar link
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDownload} className="cursor-pointer">
          <Download className="mr-2 h-4 w-4" />
          Descargar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleOpenNew} className="cursor-pointer">
          <ExternalLink className="mr-2 h-4 w-4" />
          Abrir en nueva pestaña
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
