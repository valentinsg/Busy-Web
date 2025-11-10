'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Target, Zap } from 'lucide-react';
import type { Tournament, TournamentFormatType, PlayoffFormat } from '@/types/blacktop';

interface TournamentFormatConfigProps {
  tournament: Tournament;
  onSave: (config: Partial<Tournament>) => Promise<void>;
}

export function TournamentFormatConfig({ tournament, onSave }: TournamentFormatConfigProps) {
  const [formatType, setFormatType] = useState<TournamentFormatType>(tournament.format_type || 'groups_playoff');
  const [numGroups, setNumGroups] = useState(tournament.num_groups || 2);
  const [teamsAdvance, setTeamsAdvance] = useState(tournament.teams_advance_per_group || 2);
  const [playoffFormat, setPlayoffFormat] = useState<PlayoffFormat>(tournament.playoff_format || 'single_elimination');
  const [thirdPlaceMatch, setThirdPlaceMatch] = useState(tournament.third_place_match || false);
  const [seriesLength, setSeriesLength] = useState<number>((tournament as any)?.format_config?.playoff_series_length ?? 1);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave({
        format_type: formatType,
        num_groups: numGroups,
        teams_advance_per_group: teamsAdvance,
        playoff_format: playoffFormat,
        third_place_match: thirdPlaceMatch,
        format_config: {
          ...(tournament as any)?.format_config,
          playoff_series_length: seriesLength,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tipo de formato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Formato del Torneo
          </CardTitle>
          <CardDescription>
            Selecciona cómo se organizará el torneo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={formatType} onValueChange={(v) => setFormatType(v as TournamentFormatType)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Zonas + Playoffs */}
              <div
                className={`relative flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                  formatType === 'groups_playoff'
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => setFormatType('groups_playoff')}
              >
                <RadioGroupItem value="groups_playoff" id="groups_playoff" />
                <div className="flex-1">
                  <Label htmlFor="groups_playoff" className="cursor-pointer font-semibold">
                    Zonas + Playoffs
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Fase de grupos, luego playoffs con los mejores
                  </p>
                  <Badge variant="outline" className="mt-2">Recomendado</Badge>
                </div>
              </div>

              {/* Eliminación Directa */}
              <div
                className={`relative flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                  formatType === 'single_elimination'
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => setFormatType('single_elimination')}
              >
                <RadioGroupItem value="single_elimination" id="single_elimination" />
                <div className="flex-1">
                  <Label htmlFor="single_elimination" className="cursor-pointer font-semibold">
                    Eliminación Directa
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Bracket de playoffs desde el inicio
                  </p>
                </div>
              </div>

              {/* Todos contra Todos */}
              <div
                className={`relative flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                  formatType === 'round_robin'
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => setFormatType('round_robin')}
              >
                <RadioGroupItem value="round_robin" id="round_robin" />
                <div className="flex-1">
                  <Label htmlFor="round_robin" className="cursor-pointer font-semibold">
                    Todos contra Todos
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Cada equipo juega contra todos
                  </p>
                </div>
              </div>

              {/* Personalizado */}
              <div
                className={`relative flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                  formatType === 'custom'
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => setFormatType('custom')}
              >
                <RadioGroupItem value="custom" id="custom" />
                <div className="flex-1">
                  <Label htmlFor="custom" className="cursor-pointer font-semibold">
                    Personalizado
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configura tu propio formato
                  </p>
                </div>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Configuración de Zonas */}
      {formatType === 'groups_playoff' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Configuración de Zonas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="num_groups">Número de Zonas</Label>
                <Input
                  id="num_groups"
                  type="number"
                  min="2"
                  max="4"
                  value={numGroups}
                  onChange={(e) => setNumGroups(parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ej: 2 zonas (Zona A y Zona B)
                </p>
              </div>

              <div>
                <Label htmlFor="teams_advance">Equipos que avanzan por zona</Label>
                <Input
                  id="teams_advance"
                  type="number"
                  min="1"
                  max="4"
                  value={teamsAdvance}
                  onChange={(e) => setTeamsAdvance(parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ej: Los 2 mejores de cada zona
                </p>
              </div>
            </div>

            {/* Preview visual */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Vista Previa
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: numGroups }).map((_, i) => (
                  <div key={i} className="p-3 bg-background rounded border">
                    <div className="font-semibold mb-2">Zona {String.fromCharCode(65 + i)}</div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span>Los {teamsAdvance} mejores avanzan</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuración de Playoffs */}
      {(formatType === 'groups_playoff' || formatType === 'single_elimination') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Configuración de Playoffs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Cantidad de partidos por serie (Best of)</Label>
              <div className="mt-2 grid grid-cols-3 gap-2 max-w-sm">
                {[1,3,5].map(n => (
                  <Button key={n} type="button" variant={seriesLength === n ? 'default' : 'outline'} onClick={() => setSeriesLength(n)}>
                    {n === 1 ? 'Único' : `Mejor de ${n}`}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label>Formato de Playoffs</Label>
              <RadioGroup value={playoffFormat} onValueChange={(v) => setPlayoffFormat(v as PlayoffFormat)}>
                <div className="flex items-center space-x-2 mt-2">
                  <RadioGroupItem value="single_elimination" id="single" />
                  <Label htmlFor="single" className="cursor-pointer">
                    Eliminación Simple (pierdes y quedas afuera)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="double_elimination" id="double" />
                  <Label htmlFor="double" className="cursor-pointer">
                    Doble Eliminación (segunda oportunidad)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="third_place">Partido por el 3er puesto</Label>
                <p className="text-xs text-muted-foreground">
                  Los perdedores de semifinales juegan por el 3er lugar
                </p>
              </div>
              <Switch
                id="third_place"
                checked={thirdPlaceMatch}
                onCheckedChange={setThirdPlaceMatch}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botón guardar */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} size="lg">
          {loading ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </div>
    </div>
  );
}
