/**
 * @fileoverview Tipos para autores del blog y contenido
 * @module types/author
 */

/**
 * Autor de contenido (blog posts, playlists, etc.)
 *
 * @example
 * ```ts
 * const autor: Author = {
 *   id: 'auth_123',
 *   name: 'Valentín SG',
 *   email: 'valentin@busy.com.ar',
 *   avatar: '/authors/valentin-sg.jpg',
 *   instagram: '@busy_streetwear',
 *   bio: 'Co-fundador de Busy'
 * }
 * ```
 */
export interface Author {
  /** ID único del autor (UUID) */
  id: string
  /** Nombre completo para mostrar */
  name?: string
  /** Email del autor */
  email?: string
  /** URL del avatar/foto de perfil */
  avatar?: string
  /** Handle de Instagram (con @) */
  instagram?: string
  /** Handle de Twitter/X (con @) */
  twitter?: string
  /** URL del perfil de LinkedIn */
  linkedin?: string
  /** URL del perfil de Medium */
  medium?: string
  /** Biografía corta */
  bio?: string
  /** Fecha de creación del perfil */
  created_at?: string
  /** Fecha de última actualización */
  updated_at?: string
}
