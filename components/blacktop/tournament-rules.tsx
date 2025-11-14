import { ExternalLink } from 'lucide-react';
import type { Tournament } from '@/types/blacktop';
import { TournamentRulesMarkdown } from './tournament-rules-markdown';

interface TournamentRulesProps {
  tournament: Tournament;
}

export function TournamentRules({ tournament }: TournamentRulesProps) {
  return (
    <div className="font-body">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl border bg-white/[0.04] backdrop-blur shadow-xl" style={{ borderColor: `${tournament.accent_color}30` }}>
          <div className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${tournament.accent_color}, transparent 60%)` }} />

          <div className="px-6 sm:px-10 pt-8 sm:pt-10 pb-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: tournament.accent_color }}>
              Reglamento del Torneo
            </h2>
            <p className="text-white/60 text-sm sm:text-base mt-1">Reglas oficiales y código de conducta</p>

            {tournament.rules_url && (
              <div className="mt-4">
                <a
                  href={tournament.rules_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm sm:text-base px-3 py-2 rounded-md border hover:bg-white/10 transition-colors"
                  style={{ borderColor: `${tournament.accent_color}40`, color: tournament.accent_color }}
                >
                  Ver reglamento completo
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
          </div>

          {tournament.rules_content && (
            <div className="px-6 sm:px-10 pb-8">
              <div className="rounded-xl border bg-gradient-to-b from-white/[0.03] to-transparent p-4 sm:p-6 leading-relaxed shadow-inner" style={{ borderColor: `${tournament.accent_color}20` }}>
                <div className="space-y-4 text-white/90">
                  <TournamentRulesMarkdown content={tournament.rules_content} />
                </div>
              </div>
            </div>
          )}

          <div className="px-6 sm:px-10 pb-8">
            <div className="pt-6 border-t" style={{ borderColor: `${tournament.accent_color}20` }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: tournament.accent_color }}>
                Código de conducta
              </h3>
              <ul className="space-y-2 text-white/80">
                <li>• Respeto entre jugadores, árbitros y organizadores</li>
                <li>• Juego limpio y deportivo</li>
                <li>• Cero tolerancia a la violencia física o verbal</li>
                <li>• Puntualidad en los horarios de partidos</li>
                <li>• Cuidado de las instalaciones</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
