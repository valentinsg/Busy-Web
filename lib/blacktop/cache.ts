// lib/blacktop/cache.ts
import { revalidatePath } from 'next/cache';

/**
 * Invalida el cache de fixtures de un torneo específico
 */
export function invalidateTournamentCache(tournamentId: number) {
  // Invalidar la página del torneo
  revalidatePath(`/admin/blacktop/${tournamentId}`);
  
  // Invalidar el endpoint de fixtures
  revalidatePath(`/api/admin/blacktop/tournaments/${tournamentId}/fixtures`);
  
  // Invalidar listado de torneos
  revalidatePath('/admin/blacktop');
}

/**
 * Invalida el cache de un partido específico
 */
export function invalidateMatchCache(tournamentId: number, matchId: number) {
  invalidateTournamentCache(tournamentId);
}

/**
 * Invalida todo el cache de blacktop
 */
export function invalidateBlacktopCache() {
  revalidatePath('/admin/blacktop', 'layout');
}
