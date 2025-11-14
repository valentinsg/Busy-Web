'use client';

import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Info, Sparkles } from 'lucide-react';

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
    <div className="space-y-8 font-body">
      <div className="relative overflow-hidden rounded-2xl border bg-white/[0.04] backdrop-blur shadow-xl" style={{ borderColor: `${accentColor}30` }}>
        <div className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${accentColor}, transparent 60%)` }} />
        <Card className="bg-transparent border-0 shadow-none">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${accentColor}20` }}>
                <BookOpen className="h-5 w-5" style={{ color: accentColor }} />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Info del Torneo</h3>
                <p className="text-white/60 text-sm">Formato general, términos y conceptos clave</p>
              </div>
            </div>

            {/* Formato del Torneo */}
            <div className="rounded-xl border bg-gradient-to-b from-white/[0.05] to-transparent p-4 sm:p-6 mb-8 shadow-inner" style={{ borderColor: `${accentColor}25` }}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4" style={{ color: accentColor }} />
                <h4 className="font-bold" style={{ color: accentColor }}>Formato del Torneo</h4>
              </div>
              <ul className="space-y-2 text-sm text-white/85">
                <li>• <strong>Fase de Grupos:</strong> Todos contra todos dentro de cada grupo</li>
                <li>• <strong>Clasificación:</strong> Los mejores avanzan a playoffs</li>
                <li>• <strong>Playoffs:</strong> Eliminación directa hasta la final</li>
                <li>• <strong>Desempate:</strong> Diferencia de puntos, duelo directo y puntos a favor</li>
              </ul>
              <div className="mt-3 flex items-start gap-2 text-xs text-white/60">
                <Info className="h-3.5 w-3.5 mt-0.5" style={{ color: accentColor }} />
                <span>El formato puede variar según cantidad de equipos y tiempos disponibles.</span>
              </div>
            </div>

            {/* Glosario */}
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5" style={{ color: accentColor }} />
              <h4 className="text-xl font-bold">Glosario de Términos</h4>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {glossaryTerms.map((item) => (
                <div
                  key={item.term}
                  className="p-4 rounded-lg border bg-white/[0.04] hover:bg-white/[0.07] transition-colors shadow-sm"
                  style={{ borderColor: `${accentColor}15` }}
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
    </div>
  );
}
