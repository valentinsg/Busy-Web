'use client';

// =====================================================
// PANEL DE COMENTARIOS
// =====================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Check, Calendar } from 'lucide-react';
import { createCommentAction, resolveCommentAction } from '@/app/actions/scripts';
import { toast } from 'sonner';
import type { ScriptComment } from '@/types/scripts';

interface CommentsPanelProps {
  scriptId: string;
  initialComments: ScriptComment[];
}

export function CommentsPanel({
  scriptId,
  initialComments,
}: CommentsPanelProps) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    const result = await createCommentAction(scriptId, newComment.trim());
    setIsSubmitting(false);

    if (result.success && result.data) {
      setComments([...comments, result.data]);
      setNewComment('');
      toast.success('Comentario agregado');
    } else {
      toast.error('Error al agregar comentario');
    }
  };

  const handleResolve = async (id: string, resolved: boolean) => {
    const result = await resolveCommentAction(id, scriptId, resolved);
    if (result.success && result.data) {
      setComments(comments.map((c) => (c.id === id ? result.data! : c)));
      toast.success(resolved ? 'Comentario resuelto' : 'Comentario reabierto');
    }
  };

  const unresolvedComments = comments.filter((c) => !c.resolved);
  const resolvedComments = comments.filter((c) => c.resolved);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        <h3 className="font-semibold">Comentarios</h3>
        <Badge variant="secondary">{unresolvedComments.length}</Badge>
      </div>

      {/* New Comment Form */}
      <Card className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            placeholder="Escribí un comentario..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
            {isSubmitting ? 'Enviando...' : 'Agregar Comentario'}
          </Button>
        </form>
      </Card>

      {/* Comments List */}
      <ScrollArea className="h-[500px]">
        <div className="space-y-4">
          {/* Unresolved */}
          {unresolvedComments.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Pendientes</h4>
              <div className="space-y-2">
                {unresolvedComments.map((comment) => (
                  <CommentCard
                    key={comment.id}
                    comment={comment}
                    onResolve={handleResolve}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Resolved */}
          {resolvedComments.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
                Resueltos
              </h4>
              <div className="space-y-2 opacity-60">
                {resolvedComments.map((comment) => (
                  <CommentCard
                    key={comment.id}
                    comment={comment}
                    onResolve={handleResolve}
                  />
                ))}
              </div>
            </div>
          )}

          {comments.length === 0 && (
            <Card className="p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No hay comentarios todavía
              </p>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// =====================================================
// COMMENT CARD
// =====================================================

function CommentCard({
  comment,
  onResolve,
}: {
  comment: ScriptComment;
  onResolve: (id: string, resolved: boolean) => void;
}) {
  return (
    <Card className="p-3">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm flex-1">{comment.body}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onResolve(comment.id, !comment.resolved)}
          >
            <Check
              className={`w-4 h-4 ${
                comment.resolved ? 'text-green-600' : 'text-muted-foreground'
              }`}
            />
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          {new Date(comment.created_at).toLocaleString('es-AR')}
          {comment.resolved && (
            <Badge variant="secondary" className="text-xs">
              Resuelto
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
