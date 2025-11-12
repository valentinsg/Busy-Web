// lib/blacktop/timer.ts
import type { Match, Tournament } from '@/types/blacktop';

export function calculateElapsedSeconds(match: Match): number {
  if (!match.started_at) return match.elapsed_seconds;
  if (match.paused_at) return match.elapsed_seconds;
  
  if (match.status === 'live') {
    const now = Date.now();
    const startedMs = new Date(match.started_at).getTime();
    const elapsedMs = now - startedMs;
    return match.elapsed_seconds + Math.floor(elapsedMs / 1000);
  }
  
  return match.elapsed_seconds;
}

export function getRemainingSeconds(match: Match, tournament: Tournament): number {
  const totalSeconds = tournament.period_duration_minutes * 60;
  const elapsed = calculateElapsedSeconds(match);
  return Math.max(0, totalSeconds - elapsed);
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function isPeriodFinished(match: Match, tournament: Tournament): boolean {
  return getRemainingSeconds(match, tournament) === 0;
}

export function isMatchFinished(match: Match, tournament: Tournament): boolean {
  return match.current_period >= tournament.periods_count && isPeriodFinished(match, tournament);
}
