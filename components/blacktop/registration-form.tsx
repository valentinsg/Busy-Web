'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { Tournament } from '@/types/blacktop';
import { AlertCircle, CheckCircle, FileText, Info, Instagram, Loader2, Mail, Phone, Plus, Trophy, Users, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ImageUpload } from './image-upload';
import { TournamentFlyerCarousel } from './tournament-flyer-carousel';
import { TournamentRulesMarkdown } from './tournament-rules-markdown';

interface RegistrationFormProps {
  tournament: Tournament;
  onSuccessChange?: (success: boolean) => void;
}

interface PlayerFormData {
  full_name: string;
  instagram_handle: string;
  email: string;
  is_captain: boolean;
  photo?: File | null;
}

interface PlayerErrors {
  full_name?: string;
  instagram_handle?: string;
  email?: string;
  photo?: string;
}

interface FormErrors {
  teamName?: string;
  captainName?: string;
  captainInstagram?: string;
  email?: string;
  phone?: string;
  teamPhoto?: string;
  players?: { [key: number]: PlayerErrors };
  general?: string;
}

export function RegistrationForm({ tournament, onSuccessChange }: RegistrationFormProps) {
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
  const [teamPhoto, setTeamPhoto] = useState<File | null>(null);
  const [acceptRules, setAcceptRules] = useState(false);
  const [acceptImageRights, setAcceptImageRights] = useState(false);
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const [players, setPlayers] = useState<PlayerFormData[]>([
    { full_name: '', instagram_handle: '', email: '', is_captain: true, photo: null },
    { full_name: '', instagram_handle: '', email: '', is_captain: false, photo: null },
    { full_name: '', instagram_handle: '', email: '', is_captain: false, photo: null },
  ]);

  const addPlayer = () => {
    if (players.length < tournament.players_per_team_max) {
      setPlayers([...players, { full_name: '', instagram_handle: '', email: '', is_captain: false, photo: null }]);
    }
  };

  const removePlayer = (index: number) => {
    if (players.length > tournament.players_per_team_min) {
      setPlayers(players.filter((_, i) => i !== index));
    }
  };

  const updatePlayer = (index: number, field: keyof PlayerFormData, value: string | boolean | File | null) => {
    const updated = [...players];
    updated[index] = { ...updated[index], [field]: value };
    setPlayers(updated);

    // Clear error for this field
    if (errors.players?.[index]) {
      const newErrors = { ...errors };
      if (newErrors.players?.[index]) {
        const playerErrors = newErrors.players[index] as Record<string, string>;
        delete playerErrors[field as string];
      }
      setErrors(newErrors);
    }
  };

  // Validación en tiempo real
  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'teamName':
        if (!value.trim()) {
          newErrors.teamName = 'El nombre del equipo es obligatorio';
        } else if (value.length < 3) {
          newErrors.teamName = 'Mínimo 3 caracteres';
        } else if (value.length > 30) {
          newErrors.teamName = 'Máximo 30 caracteres';
        } else {
          delete newErrors.teamName;
        }
        break;

      case 'captainName':
        if (!value.trim()) {
          newErrors.captainName = 'El nombre del capitán es obligatorio';
        } else if (value.length < 3) {
          newErrors.captainName = 'Mínimo 3 caracteres';
        } else {
          delete newErrors.captainName;
        }
        break;

      case 'captainInstagram':
        if (!value.trim()) {
          newErrors.captainInstagram = 'El Instagram es obligatorio';
        } else if (!value.startsWith('@')) {
          newErrors.captainInstagram = 'Debe comenzar con @';
        } else if (value.length < 2) {
          newErrors.captainInstagram = 'Instagram inválido';
        } else {
          delete newErrors.captainInstagram;
        }
        break;

      case 'email':
        if (!value.trim()) {
          newErrors.email = 'El email es obligatorio';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Email inválido';
        } else {
          delete newErrors.email;
        }
        break;

      case 'phone':
        if (!value.trim()) {
          newErrors.phone = 'El teléfono es obligatorio';
        } else if (value.length < 8) {
          newErrors.phone = 'Teléfono inválido';
        } else {
          delete newErrors.phone;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar datos del equipo
    if (!teamName.trim()) newErrors.teamName = 'Nombre del equipo obligatorio';
    else if (teamName.length < 3) newErrors.teamName = 'Mínimo 3 caracteres';
    else if (teamName.length > 30) newErrors.teamName = 'Máximo 30 caracteres';

    if (!captainName.trim()) newErrors.captainName = 'Nombre del capitán obligatorio';
    else if (captainName.length < 3) newErrors.captainName = 'Mínimo 3 caracteres';

    if (!captainInstagram.trim()) newErrors.captainInstagram = 'Instagram obligatorio';
    else if (!captainInstagram.startsWith('@')) newErrors.captainInstagram = 'Debe comenzar con @';

    if (!email.trim()) newErrors.email = 'Email obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Email inválido';

    if (!phone.trim()) newErrors.phone = 'Teléfono obligatorio';
    else if (phone.length < 8) newErrors.phone = 'Teléfono inválido';

    // Validar jugadores
    const playerErrors: { [key: number]: any } = {};
    players.forEach((player, index) => {
      const pErrors: any = {};

      if (!player.full_name.trim()) pErrors.full_name = 'Nombre obligatorio';
      else if (player.full_name.length < 3) pErrors.full_name = 'Mínimo 3 caracteres';

      if (!player.instagram_handle.trim()) pErrors.instagram_handle = 'Instagram obligatorio';
      else if (!player.instagram_handle.startsWith('@')) pErrors.instagram_handle = 'Debe comenzar con @';

      if (!player.email.trim()) pErrors.email = 'Email obligatorio';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(player.email)) pErrors.email = 'Email inválido';

      if (Object.keys(pErrors).length > 0) {
        playerErrors[index] = pErrors;
      }
    });

    if (Object.keys(playerErrors).length > 0) {
      newErrors.players = playerErrors;
    }

    // Validar cantidad de jugadores
    if (players.length < tournament.players_per_team_min) {
      newErrors.general = `Se requieren al menos ${tournament.players_per_team_min} jugadores`;
    }

    // Validar términos
    if (!acceptRules) {
      newErrors.general = 'Debes aceptar el reglamento';
    }

    if (!acceptImageRights) {
      newErrors.general = 'Debes aceptar el derecho de imagen';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar formulario
    if (!validateForm()) {
      setError('Por favor corrige los errores en el formulario');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Crear FormData para enviar archivos
      const formData = new FormData();

      formData.append('tournament_id', tournament.id.toString());
      formData.append('team_name', teamName);
      formData.append('captain_name', captainName);
      formData.append('captain_instagram', captainInstagram);
      formData.append('email', email);
      formData.append('whatsapp_or_phone', phone);
      formData.append('accept_rules', acceptRules.toString());
      formData.append('accept_image_rights', acceptImageRights.toString());

      // Foto del equipo
      if (teamPhoto) {
        formData.append('team_photo', teamPhoto);
      }

      // Asegurar que el capitán esté en la lista
      const playersWithCaptain = [
        {
          full_name: captainName,
          instagram_handle: captainInstagram,
          email,
          is_captain: true,
          photo: players[0]?.photo || null
        },
        ...players.slice(1),
      ];

      // Agregar jugadores
      playersWithCaptain.forEach((player, index) => {
        formData.append(`players[${index}][full_name]`, player.full_name);
        formData.append(`players[${index}][instagram_handle]`, player.instagram_handle);
        formData.append(`players[${index}][email]`, player.email);
        formData.append(`players[${index}][is_captain]`, player.is_captain.toString());

        if (player.photo) {
          formData.append(`players[${index}][photo]`, player.photo);
        }
      });

      const response = await fetch('/api/blacktop/register', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar equipo');
      }

      setSuccess(true);
      setSuccessMessage(data.message);
      
      // Notificar al padre que hubo éxito
      onSuccessChange?.(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  // Scroll al inicio cuando hay éxito
  useEffect(() => {
    if (success) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [success]);

  if (success) {
    return (
      <Card className="bg-white/10 backdrop-blur border-white/20">
        <CardContent className="py-12 text-center space-y-4">
          <CheckCircle className="h-16 w-16 mx-auto text-green-400" />
          <h2 className="text-2xl font-bold">¡Registro exitoso!</h2>
          <p className="text-lg text-white/80">{successMessage}</p>
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => router.push(`/blacktop/${tournament.slug}`)}
              className="bg-white/10 border-white/20 hover:bg-white/20"
            >
              Ver torneo
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/about')}
              className="bg-white/10 border-white/20 hover:bg-white/20"
            >
              Conoce quiénes somos
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
      {/* Error General - solo mostrar si hay un error real de API o si intentó enviar */}
      {error && (
        <div className="bg-red-500/20 border-2 border-red-500/50 text-white px-4 py-4 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Error</p>
            <p className="text-sm text-white/90 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Carousel de flyers o header simple */}
      {(() => {
        console.log('🎯 Tournament flyer_images:', tournament.flyer_images);
        return tournament.flyer_images && tournament.flyer_images.length > 0;
      })() ? (
        <TournamentFlyerCarousel
          images={tournament.flyer_images!}
          tournamentName={tournament.name}
          accentColor={tournament.accent_color}
        />
      ) : (
        <div className="text-center space-y-2 pb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full" style={{ backgroundColor: `${tournament.accent_color}20` }}>
            <Trophy className="h-8 w-8" style={{ color: tournament.accent_color }} />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white font-body">Inscripción {tournament.name}</h2>
          <p className="text-white/70 text-sm md:text-base font-body">Completa todos los datos para inscribir tu equipo</p>
        </div>
      )}

      {/* Datos del equipo */}
      <Card className="bg-white/10 backdrop-blur border-white/20 shadow-xl">
        <CardHeader className="border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${tournament.accent_color}20` }}>
              <Users className="h-5 w-5" style={{ color: tournament.accent_color }} />
            </div>
            <div>
              <CardTitle className="text-white text-xl">Datos del equipo</CardTitle>
              <CardDescription className="text-white/60 text-sm">
                Información básica y foto del equipo
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          {/* Nombre del equipo */}
          <div className="space-y-2">
            <Label htmlFor="team_name" className="text-white flex items-center gap-2">
              <Trophy className="h-4 w-4" style={{ color: tournament.accent_color }} />
              Nombre del equipo <span className="text-red-500 font-bold">*</span>
            </Label>
            <Input
              id="team_name"
              value={teamName}
              onChange={(e) => {
                setTeamName(e.target.value);
                validateField('teamName', e.target.value);
              }}
              onBlur={() => handleBlur('teamName')}
              placeholder="Los Imparables"
              className={cn(
                "bg-white/10 border-white/20 text-white placeholder:text-white/50 h-11",
                errors.teamName && touched.teamName && "border-red-400 focus-visible:ring-red-400"
              )}
            />
            {errors.teamName && touched.teamName && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.teamName}
              </p>
            )}
            <p className="text-xs text-white/50 flex items-center gap-1">
              <Info className="h-3 w-3" />
              Elige un nombre único y representativo (3-30 caracteres)
            </p>
          </div>

          {/* Foto del equipo */}
          <ImageUpload
            value={teamPhoto}
            onChange={setTeamPhoto}
            label="Foto del equipo"
            description="Opcional"
            aspectRatio="landscape"
            maxSizeMB={5}
          />

          {/* Capitán */}
          <div className="pt-4 border-t border-white/10">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Users className="h-4 w-4" style={{ color: tournament.accent_color }} />
              Datos del capitán
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre del capitán */}
              <div className="space-y-2">
                <Label htmlFor="captain_name" className="text-white">Nombre completo <span className="text-red-500 font-bold">*</span></Label>
                <Input
                  id="captain_name"
                  value={captainName}
                  onChange={(e) => {
                    setCaptainName(e.target.value);
                    updatePlayer(0, 'full_name', e.target.value);
                    validateField('captainName', e.target.value);
                  }}
                  onBlur={() => handleBlur('captainName')}
                  placeholder="Juan Pérez"
                  className={cn(
                    "bg-white/10 border-white/20 text-white placeholder:text-white/50 h-11",
                    errors.captainName && touched.captainName && "border-red-400"
                  )}
                />
                {errors.captainName && touched.captainName && (
                  <p className="text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.captainName}
                  </p>
                )}
              </div>

              {/* Instagram del capitán */}
              <div className="space-y-2">
                <Label htmlFor="captain_instagram" className="text-white flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  Instagram <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="captain_instagram"
                  value={captainInstagram}
                  onChange={(e) => {
                    const value = e.target.value.startsWith('@') ? e.target.value : `@${e.target.value}`;
                    setCaptainInstagram(value);
                    updatePlayer(0, 'instagram_handle', value);
                    validateField('captainInstagram', value);
                  }}
                  onBlur={() => handleBlur('captainInstagram')}
                  placeholder="@juanperez"
                  className={cn(
                    "bg-white/10 border-white/20 text-white placeholder:text-white/50 h-11",
                    errors.captainInstagram && touched.captainInstagram && "border-red-400"
                  )}
                />
                {errors.captainInstagram && touched.captainInstagram && (
                  <p className="text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.captainInstagram}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    updatePlayer(0, 'email', e.target.value);
                    validateField('email', e.target.value);
                  }}
                  onBlur={() => handleBlur('email')}
                  placeholder="equipo@ejemplo.com"
                  className={cn(
                    "bg-white/10 border-white/20 text-white placeholder:text-white/50 h-11",
                    errors.email && touched.email && "border-red-400"
                  )}
                />
                {errors.email && touched.email && (
                  <p className="text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  WhatsApp / Teléfono <span className="text-red-500 font-bold">*</span>
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    validateField('phone', e.target.value);
                  }}
                  onBlur={() => handleBlur('phone')}
                  placeholder="+54 9 223 123 4567"
                  className={cn(
                    "bg-white/10 border-white/20 text-white placeholder:text-white/50 h-11",
                    errors.phone && touched.phone && "border-red-400"
                  )}
                />
                {errors.phone && touched.phone && (
                  <p className="text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.phone}
                  </p>
                )}
                <p className="text-xs text-white/50 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Para coordinar detalles del torneo
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jugadores */}
      <Card className="bg-white/10 backdrop-blur border-white/20 shadow-xl">
        <CardHeader className="border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${tournament.accent_color}20` }}>
              <Users className="h-5 w-5" style={{ color: tournament.accent_color }} />
            </div>
            <div>
              <CardTitle className="text-white text-xl">Jugadores del equipo</CardTitle>
              <CardDescription className="text-white/60 text-sm">
                Mínimo {tournament.players_per_team_min}, máximo {tournament.players_per_team_max} jugadores
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {players.map((player, index) => (
            <div
              key={index}
              className={cn(
                "p-4 md:p-6 rounded-lg border transition-all",
                index === 0
                  ? "bg-gradient-to-br from-white/10 to-white/5 border-white/20"
                  : "bg-white/5 border-white/10",
                errors.players?.[index] && "border-red-400/50"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: `${tournament.accent_color}30`, color: tournament.accent_color }}
                  >
                    {index + 1}
                  </div>
                  <span className="text-white font-medium">
                    {index === 0 ? 'Capitán' : `Jugador ${index + 1}`}
                  </span>
                </div>
                {index > 0 && players.length > tournament.players_per_team_min && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePlayer(index)}
                    className="text-red-400 hover:bg-red-400/10 hover:text-red-300 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre */}
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-white text-sm">Nombre completo <span className="text-red-500 font-bold">*</span></Label>
                  <Input
                    value={player.full_name}
                    onChange={(e) => updatePlayer(index, 'full_name', e.target.value)}
                    placeholder={index === 0 ? captainName : `Nombre del jugador ${index + 1}`}
                    disabled={index === 0}
                    className={cn(
                      "bg-white/10 border-white/20 text-white placeholder:text-white/50 h-11",
                      errors.players?.[index]?.full_name && "border-red-400",
                      index === 0 && "opacity-60 cursor-not-allowed"
                    )}
                  />
                  {errors.players?.[index]?.full_name && (
                    <p className="text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.players[index].full_name}
                    </p>
                  )}
                </div>

                {/* Instagram */}
                <div className="space-y-2">
                  <Label className="text-white text-sm flex items-center gap-2">
                    <Instagram className="h-3 w-3" />
                    Instagram <span className="text-red-500 font-bold">*</span>
                  </Label>
                  <Input
                    value={player.instagram_handle}
                    onChange={(e) => {
                      const value = e.target.value.startsWith('@') ? e.target.value : `@${e.target.value}`;
                      updatePlayer(index, 'instagram_handle', value);
                    }}
                    placeholder="@instagram"
                    disabled={index === 0}
                    className={cn(
                      "bg-white/10 border-white/20 text-white placeholder:text-white/50 h-11",
                      errors.players?.[index]?.instagram_handle && "border-red-400",
                      index === 0 && "opacity-60 cursor-not-allowed"
                    )}
                  />
                  {errors.players?.[index]?.instagram_handle && (
                    <p className="text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.players[index].instagram_handle}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label className="text-white text-sm flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    Email <span className="text-red-500 font-bold">*</span>
                  </Label>
                  <Input
                    type="email"
                    value={player.email}
                    onChange={(e) => updatePlayer(index, 'email', e.target.value)}
                    placeholder="email@ejemplo.com"
                    disabled={index === 0}
                    className={cn(
                      "bg-white/10 border-white/20 text-white placeholder:text-white/50 h-11",
                      errors.players?.[index]?.email && "border-red-400",
                      index === 0 && "opacity-60 cursor-not-allowed"
                    )}
                  />
                  {errors.players?.[index]?.email && (
                    <p className="text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.players[index].email}
                    </p>
                  )}
                </div>

                {/* Foto del jugador */}
                <div className="md:col-span-2">
                  <ImageUpload
                    value={player.photo || null}
                    onChange={(file) => updatePlayer(index, 'photo', file)}
                    label={`Foto de ${index === 0 ? 'capitán' : `jugador ${index + 1}`}`}
                    description="Opcional"
                    aspectRatio="square"
                    maxSizeMB={3}
                  />
                </div>
              </div>

              {index === 0 && (
                <p className="text-xs text-white/50 mt-3 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Los datos del capitán se completan automáticamente
                </p>
              )}
            </div>
          ))}

          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-sm text-white/70 flex items-start gap-2">
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: tournament.accent_color }} />
              <span>
                Las fotos de los jugadores son <strong className="text-red-500 font-bold">opcionales</strong> pero recomendadas. Se usarán para crear los perfiles del torneo y contenido en redes sociales.
              </span>
            </p>
          </div>

          {/* Botón agregar jugador al final */}
          {players.length < tournament.players_per_team_max && (
            <Button
              type="button"
              variant="outline"
              onClick={addPlayer}
              className="w-full bg-white/10 border-white/20 hover:bg-white/20 text-white font-body"
              style={{ borderColor: `${tournament.accent_color}40` }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar jugador
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Términos */}
      <Card className="bg-white/10 backdrop-blur border-white/20 shadow-xl">
        <CardHeader className="border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${tournament.accent_color}20` }}>
              <FileText className="h-5 w-5" style={{ color: tournament.accent_color }} />
            </div>
            <div>
              <CardTitle className="text-white text-xl">Términos y condiciones</CardTitle>
              <CardDescription className="text-white/60 text-sm">
                Lee y acepta los términos para completar la inscripción
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-5">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="accept_rules"
              checked={acceptRules}
              onCheckedChange={(checked) => setAcceptRules(checked as boolean)}
              className="border-red-500 data-[state=checked]:bg-red-600 data-[state=checked]:text-white mt-1"
              style={{ borderColor: `${tournament.accent_color}80` }}
            />
            <div className="flex-1">
              <Label htmlFor="accept_rules" className="text-white text-sm leading-relaxed cursor-pointer">
                Acepto el <strong className="text-red-500 font-bold">reglamento del torneo</strong> y el <strong className="text-red-500 font-bold">código de conducta</strong> de BUSY BLACKTOP *
              </Label>
              {tournament.rules_content && (
                <Dialog 
                  open={rulesModalOpen} 
                  onOpenChange={(open) => {
                    setRulesModalOpen(open);
                    // Ocultar/mostrar header cuando se abre/cierra el modal
                    if (typeof document !== 'undefined') {
                      const header = document.querySelector('header');
                      const nav = document.querySelector('nav');
                      if (header) header.style.display = open ? 'none' : '';
                      if (nav) nav.style.display = open ? 'none' : '';
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto mt-2 text-sm font-medium"
                      style={{ color: tournament.accent_color }}
                    >
                      <FileText className="h-3.5 w-3.5 mr-1.5" />
                      Leer reglamento completo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] md:max-w-3xl lg:max-w-4xl max-h-[85vh] overflow-y-auto bg-neutral-900 text-white border-2 rounded-xl shadow-2xl z-[100]" style={{ borderColor: `${tournament.accent_color}40` }}>
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold" style={{ color: tournament.accent_color }}>Reglamento del Torneo</DialogTitle>
                      <DialogDescription className="text-red-400 font-semibold">
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

          <div className="flex items-start space-x-3">
            <Checkbox
              id="accept_image_rights"
              checked={acceptImageRights}
              onCheckedChange={(checked) => setAcceptImageRights(checked as boolean)}
              className="border-red-500 data-[state=checked]:bg-red-600 data-[state=checked]:text-white mt-1"
              style={{ borderColor: `${tournament.accent_color}80` }}
            />
            <Label htmlFor="accept_image_rights" className="text-white text-sm leading-relaxed cursor-pointer">
              Autorizo el uso de mi imagen y la de mi equipo en <strong className="text-red-500 font-bold">fotos, videos y perfiles públicos</strong> del torneo para redes sociales, web y contenido de BUSY *
            </Label>
          </div>

          <div className="bg-red-500/5 border rounded-lg p-4 mt-4" style={{ borderColor: `${tournament.accent_color}30` }}>
            <p className="text-xs text-white/60 flex items-start gap-2">
              <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" style={{ color: tournament.accent_color }} />
              <span>
                Al inscribirte aceptas que BUSY puede usar las imágenes del torneo para promover futuros eventos y crear contenido en redes sociales. Siempre etiquetaremos a los jugadores y equipos.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Botón de submit */}
      <div className="sticky bottom-4 z-10">
        <Button
          type="submit"
          disabled={loading || !acceptRules || !acceptImageRights}
          className="relative w-full text-base sm:text-lg py-5 sm:py-6 font-body font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
          style={{
            backgroundColor: tournament.accent_color,
            boxShadow: `0 4px 16px ${tournament.accent_color}30`
          }}
        >
          {/* Liquid glass effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Procesando inscripción...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                Inscribir equipo al torneo
              </>
            )}
          </span>
        </Button>
      </div>

    </form>
  );
}
