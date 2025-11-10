'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus, X, CheckCircle, FileText } from 'lucide-react';
import type { Tournament } from '@/types/blacktop';
import { TournamentRulesMarkdown } from './tournament-rules-markdown';

interface RegistrationFormProps {
  tournament: Tournament;
}

interface PlayerFormData {
  full_name: string;
  instagram_handle: string;
  email: string;
  is_captain: boolean;
}

export function RegistrationForm({ tournament }: RegistrationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [teamName, setTeamName] = useState('');
  const [captainName, setCaptainName] = useState('');
  const [captainInstagram, setCaptainInstagram] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptRules, setAcceptRules] = useState(false);
  const [acceptImageRights, setAcceptImageRights] = useState(false);
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const [players, setPlayers] = useState<PlayerFormData[]>([
    { full_name: '', instagram_handle: '', email: '', is_captain: true },
    { full_name: '', instagram_handle: '', email: '', is_captain: false },
    { full_name: '', instagram_handle: '', email: '', is_captain: false },
  ]);

  const addPlayer = () => {
    if (players.length < tournament.players_per_team_max) {
      setPlayers([...players, { full_name: '', instagram_handle: '', email: '', is_captain: false }]);
    }
  };

  const removePlayer = (index: number) => {
    if (players.length > tournament.players_per_team_min) {
      setPlayers(players.filter((_, i) => i !== index));
    }
  };

  const updatePlayer = (index: number, field: keyof PlayerFormData, value: string | boolean) => {
    const updated = [...players];
    updated[index] = { ...updated[index], [field]: value };
    setPlayers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validaciones
      if (!acceptRules) {
        throw new Error('Debes aceptar el reglamento');
      }

      if (!acceptImageRights) {
        throw new Error('Debes aceptar el derecho de imagen');
      }

      if (players.length < tournament.players_per_team_min) {
        throw new Error(`Se requieren al menos ${tournament.players_per_team_min} jugadores`);
      }

      const emptyPlayers = players.filter(p => !p.full_name || !p.instagram_handle || !p.email);
      if (emptyPlayers.length > 0) {
        throw new Error('Completa todos los datos de los jugadores (nombre, Instagram y email)');
      }

      // Validar emails
      const invalidEmails = players.filter(p => !p.email.includes('@'));
      if (invalidEmails.length > 0) {
        throw new Error('Todos los emails deben ser válidos');
      }

      // Asegurar que el capitán esté en la lista
      const playersWithCaptain = [
        { full_name: captainName, instagram_handle: captainInstagram, is_captain: true },
        ...players.filter((_, i) => i > 0),
      ];

      const response = await fetch('/api/blacktop/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournament_id: tournament.id,
          team_name: teamName,
          captain_name: captainName,
          captain_instagram: captainInstagram,
          email,
          whatsapp_or_phone: phone,
          players: playersWithCaptain,
          accept_rules: acceptRules,
          accept_image_rights: acceptImageRights,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar equipo');
      }

      setSuccess(true);
      setSuccessMessage(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="bg-white/10 backdrop-blur border-white/20">
        <CardContent className="py-12 text-center space-y-4">
          <CheckCircle className="h-16 w-16 mx-auto text-green-400" />
          <h2 className="text-2xl font-bold">¡Registro exitoso!</h2>
          <p className="text-lg text-white/80">{successMessage}</p>
          <div className="pt-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/blacktop/${tournament.slug}`)}
              className="bg-white/10 border-white/20 hover:bg-white/20"
            >
              Ver torneo
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-white px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Datos del equipo */}
      <Card className="bg-white/10 backdrop-blur border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Datos del equipo</CardTitle>
          <CardDescription className="text-white/70">
            Información básica del equipo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="team_name" className="text-white">Nombre del equipo *</Label>
            <Input
              id="team_name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Los Imparables"
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>

          <div>
            <Label htmlFor="captain_name" className="text-white">Nombre del capitán *</Label>
            <Input
              id="captain_name"
              value={captainName}
              onChange={(e) => {
                setCaptainName(e.target.value);
                updatePlayer(0, 'full_name', e.target.value);
              }}
              placeholder="Juan Pérez"
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>

          <div>
            <Label htmlFor="captain_instagram" className="text-white">Instagram del capitán *</Label>
            <Input
              id="captain_instagram"
              value={captainInstagram}
              onChange={(e) => {
                setCaptainInstagram(e.target.value);
                updatePlayer(0, 'instagram_handle', e.target.value);
              }}
              placeholder="@juanperez"
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-white">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                updatePlayer(0, 'email', e.target.value);
              }}
              placeholder="equipo@ejemplo.com"
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-white">WhatsApp / Teléfono *</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+54 9 223 123 4567"
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Jugadores */}
      <Card className="bg-white/10 backdrop-blur border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Jugadores</CardTitle>
              <CardDescription className="text-white/70">
                Mínimo {tournament.players_per_team_min}, máximo {tournament.players_per_team_max} jugadores
              </CardDescription>
            </div>
            {players.length < tournament.players_per_team_max && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPlayer}
                className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {players.map((player, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1 space-y-2">
                <Input
                  value={player.full_name}
                  onChange={(e) => updatePlayer(index, 'full_name', e.target.value)}
                  placeholder={`Nombre jugador ${index + 1}`}
                  required
                  disabled={index === 0}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <Input
                  value={player.instagram_handle}
                  onChange={(e) => updatePlayer(index, 'instagram_handle', e.target.value)}
                  placeholder="@instagram"
                  required
                  disabled={index === 0}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <Input
                  type="email"
                  value={player.email}
                  onChange={(e) => updatePlayer(index, 'email', e.target.value)}
                  placeholder="email@ejemplo.com"
                  required
                  disabled={index === 0}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              {index > 0 && players.length > tournament.players_per_team_min && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removePlayer(index)}
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Términos */}
      <Card className="bg-white/10 backdrop-blur border-white/20">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="accept_rules"
              checked={acceptRules}
              onCheckedChange={(checked) => setAcceptRules(checked as boolean)}
              className="border-white/20"
            />
            <div className="flex-1">
              <Label htmlFor="accept_rules" className="text-white text-sm leading-relaxed">
                Acepto el reglamento del torneo y el código de conducta de BUSY BLACKTOP *
              </Label>
              {tournament.rules_content && (
                <Dialog open={rulesModalOpen} onOpenChange={setRulesModalOpen}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="link"
                      className="text-red-400 hover:text-red-300 p-0 h-auto mt-1 text-sm"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Leer reglamento y código de conducta
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] md:max-w-3xl lg:max-w-4xl max-h-[85vh] overflow-y-auto bg-neutral-900 text-white border border-white/20 rounded-xl shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-white text-2xl">Reglamento del Torneo</DialogTitle>
                      <DialogDescription className="text-white/80">
                        {tournament.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 pb-2">
                      <TournamentRulesMarkdown content={tournament.rules_content} />
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="accept_image_rights"
              checked={acceptImageRights}
              onCheckedChange={(checked) => setAcceptImageRights(checked as boolean)}
              className="border-white/20"
            />
            <Label htmlFor="accept_image_rights" className="text-white text-sm leading-relaxed">
              Autorizo el uso de mi imagen y la de mi equipo en fotos, videos y perfiles públicos del torneo para redes sociales, web y contenido de BUSY *
            </Label>
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={loading}
        className="w-full text-lg py-6"
        style={{ backgroundColor: tournament.accent_color }}
      >
        {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        Inscribir equipo
      </Button>
    </form>
  );
}
