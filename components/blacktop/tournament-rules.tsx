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

        <div
          className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-8 md:p-12 space-y-6"
          style={{ borderColor: `${tournament.accent_color}40` }}
        >
          {tournament.rules_url && (
            <div>
              <a
                href={tournament.rules_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-lg hover:underline"
                style={{ color: tournament.accent_color }}
              >
                Ver reglamento completo
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>
          )}

          {tournament.rules_content && (
            <div className="text-base md:text-lg leading-relaxed">
              <TournamentRulesMarkdown content={tournament.rules_content} />
            </div>
          )}

          {/* Código de conducta básico */}
          <div className="pt-6 border-t border-white/20">
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
  );
}
