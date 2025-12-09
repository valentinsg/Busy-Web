import { getSettingsServer } from "@/lib/repo/settings"
import { NextRequest, NextResponse } from "next/server"
import { assertAdmin } from "../../../_utils"

/**
 * Simple markdown to HTML converter for email content
 */
function markdownToHtml(markdown: string): string {
  let html = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Images - must be before links! ![alt](url)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0; display: block;">')
    .replace(/^### (.+)$/gm, '<h3 style="color: #ffffff; margin: 20px 0 10px 0; font-size: 18px;">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="color: #ffffff; margin: 24px 0 12px 0; font-size: 20px;">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="color: #ffffff; margin: 28px 0 14px 0; font-size: 24px;">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #ffffff; text-decoration: underline;">$1</a>')
    .replace(/^- (.+)$/gm, '<li style="margin-bottom: 6px;">$1</li>')
    .split(/\n\n+/)
    .map(block => {
      block = block.trim()
      if (!block) return ''
      if (block.startsWith('<h') || block.startsWith('<li>') || block.startsWith('<img')) return block
      if (block.includes('<li>')) return `<ul style="margin: 0 0 16px 0; padding-left: 20px;">${block}</ul>`
      return `<p style="margin: 0 0 14px 0; color: #dddddd;">${block.replace(/\n/g, '<br>')}</p>`
    })
    .filter(Boolean)
    .join('\n')

  return html
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://busy.com.ar'
const LOGO_URL = `${BASE_URL}/BUSY_LOGO%20TRANSPARENTE-3.png`

/**
 * POST /api/admin/newsletter/campaigns/preview
 * Generate HTML preview of a campaign
 */
export async function POST(req: NextRequest) {
  const admin = await assertAdmin(req)
  if (!admin.ok) return admin.res

  try {
    const body = await req.json()
    const { subject, content, name, ctaText, ctaUrl } = body

    if (!content) {
      return NextResponse.json({ ok: false, error: "Content is required" }, { status: 400 })
    }

    const settings = await getSettingsServer()
    const currentYear = new Date().getFullYear()
    const htmlContent = markdownToHtml(content)

    // CTA Button
    const ctaButton = (ctaText && ctaUrl) ? `
      <div style="text-align: center; padding: 24px 0 8px 0;">
        <a href="${ctaUrl}" target="_blank" style="display: inline-block; background-color: #ffffff; color: #000000; text-decoration: none; padding: 12px 28px; font-weight: 600; font-size: 14px; letter-spacing: 0.5px;">
          ${ctaText}
        </a>
      </div>
    ` : ''

    // Christmas message
    const christmasMessage = settings.christmas_mode ? `
      <div style="text-align: center; padding: 16px 0; border-top: 1px solid #333333;">
        <span style="color: #888888; font-size: 13px;">✨ Felices fiestas de parte del equipo Busy ✨</span>
      </div>
    ` : ''

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject || 'Preview'}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #ffffff;
      background-color: #000000;
      margin: 0;
      padding: 0;
    }
    a { color: #ffffff; }
  </style>
</head>
<body style="background-color: #000000; margin: 0; padding: 0;">
  <div style="width: 100%; background-color: #000000; padding: 0;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #000000;">

      <!-- Header with Logo -->
      <div style="padding: 32px 24px 24px 24px; text-align: center;">
        <a href="${BASE_URL}" target="_blank">
          <img src="${LOGO_URL}" alt="BUSY" style="height: 40px; width: auto;">
        </a>
      </div>

      <!-- Main Content -->
      <div style="padding: 0 24px 24px 24px; color: #ffffff; font-size: 15px; line-height: 1.7;">
        ${htmlContent}
        ${ctaButton}
      </div>

      <!-- Divider -->
      <div style="padding: 0 24px;">
        <div style="border-top: 1px solid #222222;"></div>
      </div>

      <!-- Footer Section -->
      <div style="padding: 24px; text-align: center;">

        <!-- Brand Info -->
        <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #ffffff; letter-spacing: 1px;">BUSY STREETWEAR</p>
        <p style="margin: 0 0 16px 0; font-size: 12px; color: #666666;">Cultura urbana desde Mar del Plata, Argentina</p>

        ${christmasMessage}

        <!-- Quick Links -->
        <div style="padding: 16px 0;">
          <a href="${BASE_URL}/products" style="color: #888888; text-decoration: none; font-size: 11px; margin: 0 8px;">TIENDA</a>
          <a href="${BASE_URL}/blog" style="color: #888888; text-decoration: none; font-size: 11px; margin: 0 8px;">BLOG</a>
          <a href="${BASE_URL}/playlists" style="color: #888888; text-decoration: none; font-size: 11px; margin: 0 8px;">PLAYLISTS</a>
          <a href="${BASE_URL}/about" style="color: #888888; text-decoration: none; font-size: 11px; margin: 0 8px;">NOSOTROS</a>
        </div>

        <!-- Social Icons -->
        <div style="padding: 8px 0 16px 0;">
          <a href="https://instagram.com/busy.streetwear" target="_blank" style="margin: 0 6px; text-decoration: none; color: #666666; font-size: 12px;">IG</a>
          <span style="color: #333333;">·</span>
          <a href="https://tiktok.com/@busy.streetwear" target="_blank" style="margin: 0 6px; text-decoration: none; color: #666666; font-size: 12px;">TK</a>
          <span style="color: #333333;">·</span>
          <a href="https://youtube.com/@busystreetwear" target="_blank" style="margin: 0 6px; text-decoration: none; color: #666666; font-size: 12px;">YT</a>
          <span style="color: #333333;">·</span>
          <a href="https://open.spotify.com/user/agustinmancho" target="_blank" style="margin: 0 6px; text-decoration: none; color: #666666; font-size: 12px;">SP</a>
        </div>

        <!-- Legal -->
        <p style="margin: 0; font-size: 10px; color: #444444;">
          © 2024-${currentYear} Busy Streetwear · María Curie 5457, Mar del Plata
        </p>

        <!-- Unsubscribe -->
        <p style="margin: 12px 0 0 0; font-size: 10px; color: #444444;">
          <a href="#" style="color: #555555; text-decoration: underline;">Cancelar suscripción</a>
        </p>
      </div>

    </div>
  </div>
</body>
</html>
`

    return NextResponse.json({ ok: true, html })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Error generating preview" },
      { status: 500 }
    )
  }
}
