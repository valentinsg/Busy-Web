import { getEmailConfig, getResendClient, isEmailConfigured } from "@/lib/email/resend"
import { getSettingsServer } from "@/lib/repo/settings"
import { NextRequest, NextResponse } from "next/server"
import { assertAdmin } from "../../../../_utils"

/**
 * Simple markdown to HTML converter for email content
 * Supports: headers, bold, italic, links, lists, paragraphs
 */
function markdownToHtml(markdown: string): string {
  let html = markdown
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Line breaks to paragraphs
    .split(/\n\n+/)
    .map(block => {
      block = block.trim()
      if (!block) return ''
      if (block.startsWith('<h') || block.startsWith('<li>')) return block
      if (block.includes('<li>')) return `<ul>${block}</ul>`
      return `<p>${block.replace(/\n/g, '<br>')}</p>`
    })
    .filter(Boolean)
    .join('\n')

  return html
}

/**
 * Sanitize tag value for Resend (only ASCII letters, numbers, underscores, dashes)
 */
function sanitizeTagValue(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-zA-Z0-9_-]/g, '_') // Replace invalid chars with underscore
    .slice(0, 50) // Max 50 chars
}

/**
 * POST /api/admin/newsletter/campaigns/[id]/send
 * Send a campaign to all recipients
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await assertAdmin(req)
  if (!admin.ok) return admin.res
  const svc = admin.svc

  // Check if email is configured
  if (!isEmailConfigured()) {
    return NextResponse.json({ ok: false, error: "Email system not configured (RESEND_API_KEY missing)" }, { status: 500 })
  }

  const resend = getResendClient()
  if (!resend) {
    return NextResponse.json({ ok: false, error: "Resend client not available" }, { status: 500 })
  }

  try {
    // Get campaign
    const { data: campaign, error: campErr } = await svc
      .from("newsletter_campaigns")
      .select("*")
      .eq("id", params.id)
      .single()

    if (campErr || !campaign) {
      return NextResponse.json({ ok: false, error: "Campaign not found" }, { status: 404 })
    }

    if (campaign.status === "sent") {
      return NextResponse.json({ ok: false, error: "Campaign already sent" }, { status: 400 })
    }

    if (campaign.status === "sending") {
      return NextResponse.json({ ok: false, error: "Campaign is already being sent" }, { status: 400 })
    }

    // Get recipients
    const { data: recipients, error: recErr } = await svc
      .from("newsletter_campaign_recipients")
      .select("email, status")
      .eq("campaign_id", params.id)
      .eq("status", "ready")

    if (recErr) {
      return NextResponse.json({ ok: false, error: recErr.message }, { status: 400 })
    }

    // If no recipients from snapshot, get from subscribers based on filters
    let emailsToSend: string[] = []

    if (recipients && recipients.length > 0) {
      emailsToSend = recipients.map(r => r.email)
    } else {
      // Fallback: get subscribers based on campaign filters
      let query = svc.from("newsletter_subscribers").select("email").eq("status", "subscribed")

      if (campaign.target_tags && campaign.target_tags.length > 0) {
        query = query.contains("tags", campaign.target_tags)
      }

      const { data: subs, error: subErr } = await query
      if (subErr) {
        return NextResponse.json({ ok: false, error: subErr.message }, { status: 400 })
      }

      emailsToSend = (subs || []).map(s => s.email)
    }

    if (emailsToSend.length === 0) {
      return NextResponse.json({ ok: false, error: "No recipients to send to" }, { status: 400 })
    }

    // Update campaign status to sending
    await svc.from("newsletter_campaigns").update({ status: "sending" }).eq("id", params.id)

    // Convert markdown to HTML
    const htmlContent = markdownToHtml(campaign.content)
    const config = getEmailConfig()

    // Get settings for christmas mode
    const settings = await getSettingsServer()

    // Create base email HTML template
    const baseEmailHtml = createCampaignEmailHtml({
      subject: campaign.subject,
      content: htmlContent,
      campaignName: campaign.name,
      isChristmas: settings.christmas_mode,
      ctaText: campaign.cta_text,
      ctaUrl: campaign.cta_url,
    })

    // Send emails in batches (Resend has rate limits)
    const BATCH_SIZE = 50
    let sentCount = 0
    let failedCount = 0
    const errors: string[] = []

    for (let i = 0; i < emailsToSend.length; i += BATCH_SIZE) {
      const batch = emailsToSend.slice(i, i + BATCH_SIZE)

      // Send to each recipient individually (for tracking) - sequentially to avoid rate limits
      console.log('[send] Sending batch to:', batch)
      console.log('[send] From:', config.from, 'ReplyTo:', config.replyTo)

      const results: PromiseSettledResult<{ email: string; success: boolean; error?: string }>[] = []

      for (const email of batch) {
        try {
          // Personalize unsubscribe link for each recipient
          const personalizedHtml = baseEmailHtml.replace(
            '{{email}}',
            encodeURIComponent(email)
          )
          console.log('[send] Sending to:', email)
          // Unsubscribe URL for List-Unsubscribe header
          const unsubscribeUrl = `${BASE_URL}/newsletter/unsubscribe?email=${encodeURIComponent(email)}`

          const result = await resend.emails.send({
            from: config.from,
            to: email,
            subject: campaign.subject,
            html: personalizedHtml,
            replyTo: config.replyTo,
            // Headers for better deliverability
            headers: {
              'List-Unsubscribe': `<${unsubscribeUrl}>`,
              'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            },
            // Tags for tracking in Resend dashboard
            tags: [
              { name: 'campaign_id', value: params.id },
              { name: 'campaign_name', value: sanitizeTagValue(campaign.name) },
            ],
          })
          console.log('[send] Resend response for', email, ':', result)

          if (result.error) {
            results.push({ status: 'fulfilled', value: { email, success: false, error: result.error.message } })
          } else {
            results.push({ status: 'fulfilled', value: { email, success: true } })
          }

          // Delay 600ms between emails to stay under 2 req/sec rate limit
          await new Promise(resolve => setTimeout(resolve, 600))
        } catch (err) {
          console.error('[send] Error sending to', email, ':', err)
          results.push({ status: 'fulfilled', value: { email, success: false, error: err instanceof Error ? err.message : String(err) } })
        }
      }

      // Count results
      for (const result of results) {
        if (result.status === "fulfilled" && result.value.success) {
          sentCount++
          // Update recipient status
          await svc
            .from("newsletter_campaign_recipients")
            .update({ status: "sent" })
            .eq("campaign_id", params.id)
            .eq("email", result.value.email)
        } else {
          failedCount++
          const errorMsg = result.status === "rejected"
            ? result.reason
            : (result.value as { error?: string }).error
          errors.push(`${result.status === "fulfilled" ? (result.value as { email: string }).email : "unknown"}: ${errorMsg}`)
        }
      }

      // Small delay between batches to avoid rate limits
      if (i + BATCH_SIZE < emailsToSend.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // Update campaign status
    const finalStatus = failedCount === emailsToSend.length ? "failed" : "sent"
    await svc
      .from("newsletter_campaigns")
      .update({
        status: finalStatus,
        sent_count: sentCount,
        error: errors.length > 0 ? errors.slice(0, 5).join("; ") : null
      })
      .eq("id", params.id)

    return NextResponse.json({
      ok: true,
      sent: sentCount,
      failed: failedCount,
      total: emailsToSend.length,
      status: finalStatus
    })

  } catch (e: unknown) {
    // Revert status on error
    await svc.from("newsletter_campaigns").update({ status: "failed", error: e instanceof Error ? e.message : String(e) }).eq("id", params.id)
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}

// Base URL for assets
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://busy.com.ar'

// Logo hosted publicly (use absolute URL for email clients)
const LOGO_URL = `${BASE_URL}/brand/BUSY_LOGO%20TRANSPARENTE-3.png`

/**
 * Create campaign email HTML template
 * Optimized for deliverability and spam avoidance
 */
function createCampaignEmailHtml(params: {
  subject: string
  content: string
  campaignName: string
  isChristmas?: boolean
  ctaText?: string
  ctaUrl?: string
}): string {
  const currentYear = new Date().getFullYear()
  const christmasBanner = params.isChristmas ? `
    <div style="background: linear-gradient(90deg, #c41e3a 0%, #228b22 50%, #c41e3a 100%); padding: 12px 24px; text-align: center;">
      <span style="color: #ffffff; font-size: 14px; letter-spacing: 1px;">
        ❄️ ¡Felices Fiestas de parte de todo el equipo Busy! ❄️
      </span>
    </div>
  ` : ''

  const christmasDecoration = params.isChristmas ? `
    <div style="text-align: center; padding: 8px 0;">
      <span style="font-size: 20px;">🎄 🎁 ⭐ 🎁 🎄</span>
    </div>
  ` : ''

  // CTA Button
  const ctaButton = (params.ctaText && params.ctaUrl) ? `
    <div style="text-align: center; padding: 24px 0;">
      <a href="${params.ctaUrl}" target="_blank" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
        ${params.ctaText}
      </a>
    </div>
  ` : ''

  return `
<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <title>${params.subject}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
      width: 100% !important;
      height: 100% !important;
    }

    .email-wrapper {
      width: 100%;
      background-color: #f5f5f5;
      padding: 20px 0;
    }

    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .header {
      background-color: #000000;
      padding: 32px 24px;
      text-align: center;
    }

    .header-logo {
      max-height: 50px;
      width: auto;
    }

    .content {
      padding: 32px 24px;
    }

    .content h1, .content h2, .content h3 {
      color: #000000;
      margin-top: 24px;
      margin-bottom: 12px;
    }
    .content h1 { font-size: 28px; }
    .content h2 { font-size: 22px; }
    .content h3 { font-size: 18px; }

    .content p {
      margin: 0 0 16px 0;
      color: #333333;
      font-size: 16px;
    }

    .content a {
      color: #000000;
      text-decoration: underline;
    }

    .content ul, .content ol {
      margin: 0 0 16px 0;
      padding-left: 24px;
    }

    .content li {
      margin-bottom: 8px;
    }

    .content img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
    }

    /* Quick Links Section */
    .quick-links {
      background-color: #000000;
      padding: 20px 24px;
      text-align: center;
    }

    .quick-links a {
      color: #ffffff;
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      margin: 0 12px;
      display: inline-block;
    }

    .quick-links a:hover {
      text-decoration: underline;
    }

    /* Social Links */
    .social-links {
      padding: 20px 24px;
      text-align: center;
      background-color: #fafafa;
    }

    .social-links a {
      display: inline-block;
      margin: 0 8px;
    }

    .social-icon {
      width: 32px;
      height: 32px;
    }

    /* Footer */
    .footer {
      background-color: #f5f5f5;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #666666;
      border-top: 1px solid #e5e5e5;
    }

    .footer p {
      margin: 8px 0;
    }

    .footer a {
      color: #666666;
      text-decoration: underline;
    }

    .footer-brand {
      font-weight: 600;
      color: #333333;
    }

    .unsubscribe {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e5e5e5;
    }

    /* Responsive */
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        border-radius: 0;
      }
      .content {
        padding: 24px 16px;
      }
      .quick-links a {
        display: block;
        margin: 8px 0;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <!-- Christmas Banner (if enabled) -->
      ${christmasBanner}

      <!-- Header with Logo -->
      <div class="header">
        <a href="${BASE_URL}" target="_blank">
          <img src="${LOGO_URL}" alt="Busy Streetwear" class="header-logo" style="max-height: 50px; width: auto;">
        </a>
      </div>

      <!-- Main Content -->
      <div class="content">
        ${christmasDecoration}
        ${params.content}
        ${ctaButton}
      </div>

      <!-- Quick Links -->
      <div class="quick-links">
        <a href="${BASE_URL}/products" target="_blank">TIENDA</a>
        <a href="${BASE_URL}/blog" target="_blank">BLOG</a>
        <a href="${BASE_URL}/playlists" target="_blank">PLAYLISTS</a>
        <a href="${BASE_URL}/blacktop" target="_blank">BLACKTOP</a>
        <a href="${BASE_URL}/about" target="_blank">NOSOTROS</a>
      </div>

      <!-- Social Links -->
      <div class="social-links">
        <a href="https://instagram.com/busy.streetwear" target="_blank" title="Instagram">
          <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" alt="Instagram" class="social-icon" style="width: 28px; height: 28px;">
        </a>
        <a href="https://tiktok.com/@busy.streetwear" target="_blank" title="TikTok">
          <img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" alt="TikTok" class="social-icon" style="width: 28px; height: 28px;">
        </a>
        <a href="https://youtube.com/@busystreetwear" target="_blank" title="YouTube">
          <img src="https://cdn-icons-png.flaticon.com/512/174/174883.png" alt="YouTube" class="social-icon" style="width: 28px; height: 28px;">
        </a>
        <a href="https://open.spotify.com/user/agustinmancho" target="_blank" title="Spotify">
          <img src="https://cdn-icons-png.flaticon.com/512/174/174872.png" alt="Spotify" class="social-icon" style="width: 28px; height: 28px;">
        </a>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p class="footer-brand">Busy Streetwear</p>
        <p>Cultura urbana, moda y comunidad desde Mar del Plata, Argentina</p>
        <p>📍 María Curie 5457, Mar del Plata, Buenos Aires</p>
        <p>📧 <a href="mailto:hola@busy.com.ar">hola@busy.com.ar</a> | 🌐 <a href="${BASE_URL}">busy.com.ar</a></p>
        <p style="margin-top: 12px;">© 2024-${currentYear} Busy Streetwear. Todos los derechos reservados.</p>

        <div class="unsubscribe">
          <p style="color: #999999; font-size: 11px;">
            Recibiste este email porque estás suscrito a nuestra newsletter.
          </p>
          <p>
            <a href="${BASE_URL}/newsletter/unsubscribe?email={{email}}" style="color: #999999;">Cancelar suscripción</a>
            &nbsp;|&nbsp;
            <a href="${BASE_URL}/newsletter/preferences?email={{email}}" style="color: #999999;">Preferencias</a>
          </p>
        </div>
      </div>
    </div>

    <!-- Anti-spam footer -->
    <div style="text-align: center; padding: 16px; font-size: 11px; color: #999999;">
      <p style="margin: 0;">Este mensaje fue enviado por Busy Streetwear, María Curie 5457, Mar del Plata (7600), Argentina.</p>
    </div>
  </div>
</body>
</html>
`
}
