'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { Tournament } from '@/types/blacktop';
import { AlertCircle, CheckCircle, FileText, Info, Instagram, Loader2, Mail, Phone, Plus, Users, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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

// Helper function to adjust color brightness
const adjustBrightness = (color: string, percent: number): string => {
  // Convert hex to RGB
  const r = parseInt(color.substring(1, 3), 16);
  const g = parseInt(color.substring(3, 5), 16);
  const b = parseInt(color.substring(5, 7), 16);

  // Adjust brightness
  const adjust = (value: number) => {
    const newValue = Math.max(0, Math.min(255, value + (value * percent) / 100));
    return Math.round(newValue);
  };

  // Convert back to hex
  return `#${[
    adjust(r).toString(16).padStart(2, '0'),
    adjust(g).toString(16).padStart(2, '0'),
    adjust(b).toString(16).padStart(2, '0')
  ].join('')}`;
};

// Helper function to adjust color opacity
const adjustOpacity = (color: string, opacity: number): string => {
  // Convert hex to RGB
  const r = parseInt(color.substring(1, 3), 16);
  const g = parseInt(color.substring(3, 5), 16);
  const b = parseInt(color.substring(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export function RegistrationForm({ tournament, onSuccessChange }: RegistrationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Form state
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
  const [form, setForm] = useState({
    teamName: '',
    captainName: '',
    captainInstagram: '',
    email: '',
    phone: '',
  });

  // Players state
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
        <div className="bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error al enviar el formulario</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Carousel de flyers */}
      {tournament.flyer_images && tournament.flyer_images.length > 0 && (
        <div className="mb-8 rounded-xl overflow-hidden shadow-2xl">
          <TournamentFlyerCarousel
            images={tournament.flyer_images}
            tournamentName={tournament.name}
            accentColor={tournament.accent_color}
          />
        </div>
      )}

      {/* Datos del equipo */}
      <Card className="bg-gradient-to-br from-white/5 to-white/[0.03] backdrop-blur-sm border border-white/10 shadow-lg overflow-hidden">
        <div
          className="h-2 w-full"
          style={{ backgroundColor: tournament.accent_color }}
        ></div>
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-2xl font-bold tracking-tight">
            Información del equipo
          </CardTitle>
          <CardDescription className="text-white/70">
            Completa la información básica de tu equipo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-2">
        {/* Nombre del equipo */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" style={{ color: tournament.accent_color }} />
            <Label htmlFor="teamName" className="text-white/90 font-medium">
              Nombre del equipo <span className="text-red-500">*</span>
            </Label>
          </div>
          <div className="relative">
            <Input
              id="teamName"
              type="text"
              placeholder="Ej: Los Campeones"
              className={cn(
                'pl-12 bg-white/5 border-white/20 text-white placeholder:text-white/30 h-14 text-base rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black/50',
                errors.teamName ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-white/50',
                'hover:bg-white/10 focus:bg-white/10'
              )}
              style={{
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
              value={teamName}
              onChange={(e) => {
                setTeamName(e.target.value);
                validateField('teamName', e.target.value);
              }}
              onBlur={() => handleBlur('teamName')}
            />
            <Users className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
          </div>
          {errors.teamName && (
            <div className="flex items-start gap-2 text-red-400 text-sm mt-1 bg-red-500/10 px-3 py-2 rounded-md">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{errors.teamName}</span>
            </div>
          )}
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
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" style={{ color: tournament.accent_color }} />
                <Label htmlFor="captainName" className="text-white/90 font-medium">
                  Nombre completo <span className="text-red-500">*</span>
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="captainName"
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  className={cn(
                    'pl-12 bg-white/5 border-white/20 text-white placeholder:text-white/30 h-14 text-base rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black/50',
                    errors.captainName ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-white/50',
                    'hover:bg-white/10 focus:bg-white/10'
                  )}
                  style={{
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                  value={captainName}
                  onChange={(e) => {
                    setCaptainName(e.target.value);
                    updatePlayer(0, 'full_name', e.target.value);
                    validateField('captainName', e.target.value);
                  }}
                  onBlur={() => handleBlur('captainName')}
                />
                <Users className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
              </div>
              {errors.captainName && (
                <div className="flex items-start gap-2 text-red-400 text-sm mt-1 bg-red-500/10 px-3 py-2 rounded-md">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{errors.captainName}</span>
                </div>
              )}
            </div>

            {/* Instagram del capitán */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="captainInstagram" className="text-white/90 font-medium">
                  Instagram <span className="text-red-500">*</span>
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="captainInstagram"
                  type="text"
                  placeholder="Ej: @juanperez"
                  className={cn(
                    'pl-12 bg-white/5 border-white/20 text-white placeholder:text-white/30 h-14 text-base rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black/50',
                    errors.captainInstagram ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-white/50',
                    'hover:bg-white/10 focus:bg-white/10'
                  )}
                  style={{
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                  value={captainInstagram}
                  onChange={(e) => {
                    const value = e.target.value.startsWith('@') ? e.target.value : `@${e.target.value}`;
                    setCaptainInstagram(value);
                    updatePlayer(0, 'instagram_handle', value);
                    validateField('captainInstagram', value);
                  }}
                  onBlur={() => handleBlur('captainInstagram')}
                />
                <Instagram className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
              </div>
              {errors.captainInstagram && (
                <div className="flex items-start gap-2 text-red-400 text-sm mt-1 bg-red-500/10 px-3 py-2 rounded-md">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{errors.captainInstagram}</span>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5" style={{ color: tournament.accent_color }} />
                <Label htmlFor="email" className="text-white/90 font-medium">
                  Email <span className="text-red-500">*</span>
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="Ej: equipo@ejemplo.com"
                  className={cn(
                    'pl-12 bg-white/5 border-white/20 text-white placeholder:text-white/30 h-14 text-base rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black/50',
                    errors.email ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-white/50',
                    'hover:bg-white/10 focus:bg-white/10'
                  )}
                  style={{
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    updatePlayer(0, 'email', e.target.value);
                    validateField('email', e.target.value);
                  }}
                  onBlur={() => handleBlur('email')}
                />
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
              </div>
              {errors.email && (
                <div className="flex items-start gap-2 text-red-400 text-sm mt-1 bg-red-500/10 px-3 py-2 rounded-md">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            {/* Teléfono */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5" style={{ color: tournament.accent_color }} />
                <Label htmlFor="phone" className="text-white/90 font-medium">
                  WhatsApp / Teléfono <span className="text-red-500">*</span>
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="phone"
                  type="text"
                  placeholder="Ej: +54 9 223 123 4567"
                  className={cn(
                    'pl-12 bg-white/5 border-white/20 text-white placeholder:text-white/30 h-14 text-base rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black/50',
                    errors.phone ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-white/50',
                    'hover:bg-white/10 focus:bg-white/10'
                  )}
                  style={{
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    validateField('phone', e.target.value);
                  }}
                  onBlur={() => handleBlur('phone')}
                />
                <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
              </div>
              {errors.phone && (
                <div className="flex items-start gap-2 text-red-400 text-sm mt-1 bg-red-500/10 px-3 py-2 rounded-md">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{errors.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div> {/* Close captain section div */}
        </CardContent>
      </Card>

      {/* Jugadores */}
      <Card className="bg-gradient-to-br from-white/5 to-white/[0.03] backdrop-blur-sm border border-white/10 shadow-lg overflow-hidden mt-10">
        <div
          className="h-2 w-full"
          style={{ backgroundColor: tournament.accent_color }}
        ></div>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-white text-2xl font-bold tracking-tight">
                Jugadores
              </CardTitle>
              <CardDescription className="text-white/70">
                Agrega al menos {tournament.players_per_team_min} jugadores (incluyendo al capitán)
              </CardDescription>
            </div>
            <Button
              type="button"
              onClick={addPlayer}
              disabled={players.length >= tournament.players_per_team_max}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 h-11 px-6 font-medium rounded-lg transition-all hover:shadow-lg hover:scale-[1.02] active:scale-95 flex-shrink-0"
              style={{
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Plus className="h-5 w-5 mr-2" />
              Agregar jugador
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 pt-2">
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
                  <DialogContent
                    className="relative w-[95vw] md:max-w-3xl lg:max-w-4xl max-h-[85vh] overflow-y-auto bg-neutral-900/95 text-white border rounded-2xl shadow-2xl backdrop-blur z-[100]"
                    style={{ borderColor: `${tournament.accent_color}40` }}
                  >
                    <div
                      className="absolute inset-x-0 top-0 h-1 rounded-t-2xl"
                      style={{ background: `linear-gradient(90deg, ${tournament.accent_color}, transparent 60%)` }}
                    />
                    <DialogHeader className="px-4 pt-4">
                      <DialogTitle
                        className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                        style={{ color: tournament.accent_color }}
                      >
                        Reglamento del Torneo
                      </DialogTitle>
                      <DialogDescription className="text-white/70">
                        {tournament.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-2 pb-4">
                      <div
                        className="rounded-xl border bg-gradient-to-b from-white/[0.04] to-transparent p-4 sm:p-6 leading-relaxed shadow-inner"
                        style={{ borderColor: `${tournament.accent_color}25` }}
                      >
                        <div className="space-y-4 text-white/90">
                          <TournamentRulesMarkdown content={tournament.rules_content || ''} />
                        </div>
                      </div>
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
          className="relative w-full text-base sm:text-lg py-5 sm:py-6 font-body font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group text-white"
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
