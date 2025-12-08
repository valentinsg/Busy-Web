"use client";

import { AdminGuard } from "@/components/admin/admin-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

/** Convert R2 URLs to proxy URLs */
function getProxyUrl(url: string | null): string {
  if (!url) return '';
  const r2Match = url.match(/https:\/\/[^/]+\.r2\.dev\/(.+)/);
  if (r2Match) return `/api/files/image/${r2Match[1]}`;
  return url;
}

interface ArchiveEntryRow {
  id: string;
  thumb_url: string;
  medium_url: string;
  full_url: string;
  colors: string[];
  mood: string[];
  place: string | null;
  person: string | null;
  tags: string[];
  microcopy: string | null;
  likes: number;
  views: number;
  is_public: boolean;
  created_at: string;
}

interface PaginatedResponse {
  data: ArchiveEntryRow[];
  hasMore: boolean;
  total: number;
}

const PAGE_SIZE = 15;

export default function AdminArchiveEntriesPage() {
  return (
    <AdminGuard>
      <ArchiveEntriesList />
    </AdminGuard>
  );
}

function ArchiveEntriesList() {
  const [entries, setEntries] = useState<ArchiveEntryRow[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadPage = async (pageToLoad: number, append = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(pageToLoad),
        pageSize: String(PAGE_SIZE),
        admin: 'true', // Include private entries in admin view
      });

      const res = await fetch(`/api/files/list?${params.toString()}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudieron cargar las entradas de Busy Files.");
      }

      const data = (await res.json()) as PaginatedResponse;
      setEntries((prev) => (append ? [...prev, ...(data.data || [])] : data.data || []));
      setHasMore(Boolean(data.hasMore));
      setTotal(data.total || 0);
      setPage(pageToLoad);
    } catch (error: unknown) {
      console.error(error);
      const message =
        error instanceof Error
          ? error.message
          : "No se pudieron cargar las entradas de Busy Files.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    // Carga inicial
    void loadPage(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadMore = () => {
    if (loading || !hasMore) return;
    void loadPage(page + 1, true);
  };

  const handleDelete = async (entryId: string) => {
    if (deletingId || !entryId) return;

    const confirmed = window.confirm('¿Seguro que querés eliminar esta entrada de Busy Files?');
    if (!confirmed) return;

    try {
      setDeletingId(entryId);
      const res = await fetch(`/api/files/${entryId}`, {
        method: 'DELETE',
      });

      const data = await res.json().catch(() => ({}));

      // Even if the entry was already deleted (404), remove it from the UI
      if (!res.ok && res.status !== 404) {
        if (!data?.ok) {
          throw new Error(data?.error || 'No se pudo eliminar la entrada.');
        }
      }

      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      setTotal((prev) => (prev > 0 ? prev - 1 : 0));

      toast({
        title: 'Entrada eliminada',
        description: 'La pieza fue eliminada de Busy Files.',
      });
    } catch (error: unknown) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : 'No se pudo eliminar la entrada.';
      toast({
        title: 'Error al eliminar',
        description: message,
        variant: 'destructive',
      });
      // Still remove from UI if it's a "not found" type error
      if (message.includes('not found') || message.includes('no existe')) {
        setEntries((prev) => prev.filter((e) => e.id !== entryId));
        setTotal((prev) => (prev > 0 ? prev - 1 : 0));
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 font-body">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold tracking-tight">Busy Files · Entradas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Administración de piezas subidas a Busy Files. {total > 0 && `${total} entr${total === 1 ? "ada" : "adas"} en total.`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/files" target="_blank" className="hidden md:inline-flex">
            <Button variant="outline" size="sm" className="font-body gap-1">
              <ExternalLink className="h-3.5 w-3.5" /> Ver público
            </Button>
          </Link>
          <Link href="/admin/files">
            <Button size="sm" className="font-body gap-1">
              <Plus className="h-3.5 w-3.5" /> Nueva entrada
            </Button>
          </Link>
        </div>
      </div>

      {initialLoading ? (
        <LoadingSpinner text="Cargando Busy Files..." />
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-2">
            <p className="text-lg font-semibold">Todavía no hay entradas en Busy Files.</p>
            <p className="text-sm text-muted-foreground">Usá el uploader para crear la primera pieza.</p>
            <Link href="/admin/files">
              <Button size="sm" className="mt-3 font-body">
                <Plus className="h-3.5 w-3.5 mr-1" /> Crear entrada
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => {
            const created = entry.created_at
              ? format(new Date(entry.created_at), "d MMM yyyy · HH:mm", { locale: es })
              : "";

            return (
              <Card key={entry.id} className="border border-border/60 bg-card/80">
                <CardContent className="p-4 flex flex-col gap-4 md:flex-row md:items-stretch">
                  <div className="w-full md:w-40 md:flex-shrink-0">
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md bg-muted/40">
                      {entry.thumb_url ? (
                        <Image
                          src={getProxyUrl(entry.thumb_url)}
                          alt={entry.microcopy || "Imagen Busy Files"}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                          Sin imagen
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-sm font-semibold font-heading line-clamp-2">
                          {entry.microcopy || "(Sin microcopy)"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {created && <span>{created}</span>}
                          {entry.place && <span>· {entry.place}</span>}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 text-[11px]">
                        {entry.mood?.length > 0 && (
                          <Badge variant="outline" className="border-emerald-500/40 text-emerald-300 bg-emerald-500/5">
                            {entry.mood.join(", ")}
                          </Badge>
                        )}
                        {entry.tags?.slice(0, 4).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="border-white/20 bg-white/5 text-[11px] font-body"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>

                      {entry.person && (
                        <p className="text-xs text-muted-foreground">
                          Persona / equipo: <span className="font-medium text-foreground">{entry.person}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <div className="flex gap-2">
                        <span>Likes: {entry.likes}</span>
                        <span>Views: {entry.views}</span>
                        <span>{entry.is_public ? "Pública" : "Oculta"}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/admin/files/entries/${entry.id}/edit`}>
                          <Button variant="outline" size="sm" className="font-body gap-1">
                            <Pencil className="h-3 w-3" /> Editar
                          </Button>
                        </Link>
                        <Link href={`/files/${entry.id}`} target="_blank">
                          <Button variant="outline" size="sm" className="font-body gap-1">
                            <ExternalLink className="h-3 w-3" /> Ver
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="font-body gap-1 text-red-400 border-red-500/40 hover:bg-red-500/10"
                          onClick={() => handleDelete(entry.id)}
                          disabled={deletingId === entry.id}
                        >
                          <Trash2 className="h-3 w-3" />
                          {deletingId === entry.id ? 'Eliminando...' : 'Eliminar'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <div className="flex justify-center py-4">
            {hasMore ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadMore}
                disabled={loading}
                className="font-body"
              >
                {loading ? "Cargando..." : "Cargar más"}
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground">No hay más entradas para cargar.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
