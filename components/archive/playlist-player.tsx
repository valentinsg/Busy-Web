'use client';

import { cn } from '@/lib/utils';
import { Music2, Pause, Play, Volume2 } from 'lucide-react';
import { useRef, useState } from 'react';

interface PlaylistPlayerProps {
  accentColor: string;
  audioUrl?: string;
}

export function PlaylistPlayer({ accentColor, audioUrl }: PlaylistPlayerProps) {
  const [open, setOpen] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {
          // Autoplay blocked or error
          console.log('Autoplay blocked or audio error');
        });
      }
      setPlaying(!playing);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-4 left-4 z-30">
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="mb-2 text-xs text-muted-foreground hover:text-foreground"
      >
        Cerrar playlist
      </button>
      <div
        className="flex w-64 flex-col gap-3 rounded-2xl border bg-background/95 p-3 shadow-lg backdrop-blur"
        style={{ borderColor: accentColor }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-background"
            style={{ backgroundColor: accentColor }}
          >
            <Music2 className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-medium leading-tight">Busy Archive Vibes</div>
            <div className="text-[11px] text-muted-foreground">Playlist curada para este mood</div>
          </div>
          <button
            type="button"
            onClick={handlePlayPause}
            disabled={!audioUrl}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full border text-xs transition-colors',
              playing ? 'border-emerald-400 text-emerald-400' : 'border-muted-foreground/40 text-muted-foreground',
              !audioUrl && 'opacity-50 cursor-not-allowed',
            )}
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        </div>

        {audioUrl && (
          <div className="flex items-center gap-2">
            <Volume2 className="h-3 w-3 text-muted-foreground" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="h-1 flex-1 cursor-pointer rounded-full bg-muted appearance-none"
              style={{
                background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${volume * 100}%, var(--color-muted) ${volume * 100}%, var(--color-muted) 100%)`,
              }}
            />
          </div>
        )}

        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setPlaying(false)}
          crossOrigin="anonymous"
        />
      </div>
    </div>
  );
}
