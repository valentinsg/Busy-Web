// =====================================================
// ARTIST SUBMISSION EMAIL TEMPLATE
// Email para notificar nueva propuesta de artista
// =====================================================

import { createEmailLayout, createButton, createInfoBox } from './base'
import type { ArtistSubmissionEmailData } from '@/types/email'

export function createArtistSubmissionEmail(data: ArtistSubmissionEmailData): string {
  const linksHtml = []
  if (data.trackUrl) {
    linksHtml.push(`<p style="margin: 0 0 8px 0;">🎵 <strong>Track:</strong> <a href="${data.trackUrl}" style="color: #FF6B00;">${data.trackUrl}</a></p>`)
  }
  if (data.spotifyUrl) {
    linksHtml.push(`<p style="margin: 0 0 8px 0;">🎧 <strong>Spotify:</strong> <a href="${data.spotifyUrl}" style="color: #FF6B00;">${data.spotifyUrl}</a></p>`)
  }
  if (data.instagram) {
    linksHtml.push(`<p style="margin: 0 0 8px 0;">📸 <strong>Instagram:</strong> <a href="${data.instagram}" style="color: #FF6B00;">${data.instagram}</a></p>`)
  }
  if (data.youtube) {
    linksHtml.push(`<p style="margin: 0 0 8px 0;">📹 <strong>YouTube:</strong> <a href="${data.youtube}" style="color: #FF6B00;">${data.youtube}</a></p>`)
  }

  const content = `
    <h1 class="email-title">🎵 Nueva Propuesta de Artista</h1>
    
    <p class="email-text">
      ¡Un artista quiere colaborar con Busy! Revisa su propuesta y decide si quieres incluirlo en tus playlists.
    </p>

    ${createInfoBox(`
      <p style="margin: 0 0 8px 0;"><strong>Artista:</strong> ${data.artistName}</p>
      <p style="margin: 0 0 8px 0;"><strong>Email:</strong> <a href="mailto:${data.email}" style="color: #FF6B00;">${data.email}</a></p>
      ${data.phone ? `<p style="margin: 0 0 8px 0;"><strong>Teléfono:</strong> ${data.phone}</p>` : ''}
      ${data.genre ? `<p style="margin: 0;"><strong>Género:</strong> ${data.genre}</p>` : ''}
    `)}

    ${
      linksHtml.length > 0
        ? `
    <h2 style="font-size: 18px; font-weight: 600; margin: 32px 0 16px 0;">Enlaces</h2>
    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 16px 0;">
      ${linksHtml.join('\n      ')}
    </div>
    `
        : ''
    }

    ${
      data.message
        ? `
    <h2 style="font-size: 18px; font-weight: 600; margin: 32px 0 16px 0;">Mensaje del Artista</h2>
    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 16px 0; font-style: italic;">
      "${data.message}"
    </div>
    `
        : ''
    }

    <div style="text-align: center; margin: 32px 0;">
      ${createButton({
        text: 'Revisar Propuesta',
        url: data.actionUrl,
        accent: true,
      })}
    </div>

    <hr class="email-divider">

    <p class="email-text-muted">
      💡 <strong>Tip:</strong> Escucha el track del artista y revisa su perfil antes de tomar una decisión. 
      Puedes aprobar, rechazar o marcar como "en revisión" desde el panel de administración.
    </p>
  `

  return createEmailLayout({
    title: `Nueva Propuesta: ${data.artistName} - Busy Streetwear`,
    preheader: `${data.artistName} quiere colaborar contigo. Género: ${data.genre || 'No especificado'}`,
    content,
  })
}
