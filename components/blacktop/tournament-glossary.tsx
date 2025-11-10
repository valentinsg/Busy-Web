'use client';

import { Card, CardContent } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

interface TournamentGlossaryProps {
  accentColor: string;
}

const glossaryTerms = [
  { term: 'PTS', definition: 'Puntos - Total de puntos anotados' },
  { term: 'PPP', definition: 'Puntos Por Partido - Promedio de puntos por juego' },
  { term: 'REB', definition: 'Rebotes - Total de rebotes capturados' },
  { term: 'RBP', definition: 'Rebotes Por Partido - Promedio de rebotes por juego' },
  { term: 'AST', definition: 'Asistencias - Pases que resultan en canasta' },
  { term: 'ASP', definition: 'Asistencias Por Partido - Promedio de asistencias por juego' },
  { term: 'ROB', definition: 'Robos - Balones recuperados al rival' },
  { term: 'ROP', definition: 'Robos Por Partido - Promedio de robos por juego' },
  { term: 'TAP', definition: 'Tapones - Tiros bloqueados' },
  { term: 'PER', definition: 'Pérdidas - Balones perdidos' },
  { term: 'PDP', definition: 'Pérdidas Por Partido - Promedio de pérdidas por juego' },
  { term: 'PJ', definition: 'Partidos Jugados - Cantidad de juegos disputados' },
  { term: 'MVP', definition: 'Most Valuable Player - Jugador más valioso del partido' },
  { term: 'G', definition: 'Ganados - Partidos ganados' },
  { term: 'P', definition: 'Perdidos - Partidos perdidos' },
  { term: 'PCT', definition: 'Porcentaje - Porcentaje de victorias' },
  { term: 'DIF', definition: 'Diferencial - Diferencia de puntos a favor/contra' },
  { term: 'Grupo', definition: 'Fase inicial donde equipos juegan todos contra todos' },
  { term: 'Playoff', definition: 'Fase eliminatoria del torneo' },
  { term: 'Semifinal', definition: 'Penúltima ronda antes de la final' },
  { term: 'Final', definition: 'Partido decisivo del campeonato' },
  { term: 'Tercer Puesto', definition: 'Partido entre perdedores de semifinales' },
];

export function TournamentGlossary({ accentColor }: TournamentGlossaryProps) {
  return (
    <div className="space-y-6 font-body">
      <Card className="bg-white/10 backdrop-blur border-white/20">
        <CardContent className="p-6">
          {/* Formato del Torneo first */}
          <div className="p-4 rounded-lg bg-white/5 border border-white/10 mb-8">
            <h4 className="font-bold mb-2" style={{ color: accentColor }}>Formato del Torneo</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>• <strong>Fase de Grupos:</strong> Los equipos se dividen en grupos y juegan todos contra todos</li>
              <li>• <strong>Clasificación:</strong> Los mejores equipos de cada grupo avanzan a playoffs</li>
              <li>• <strong>Playoffs:</strong> Eliminación directa hasta definir al campeón</li>
              <li>• <strong>Criterios de desempate:</strong> Diferencia de puntos, enfrentamiento directo, puntos anotados</li>
            </ul>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="h-5 w-5" style={{ color: accentColor }} />
            <h3 className="text-2xl font-bold">Glosario de Términos</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {glossaryTerms.map((item) => (
              <div
                key={item.term}
                className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="px-3 py-1 rounded font-bold text-sm shrink-0"
                    style={{ backgroundColor: `${accentColor}30`, color: accentColor }}
                  >
                    {item.term}
                  </span>
                  <p className="text-sm text-white/80 leading-relaxed">{item.definition}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
