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
    // Escape HTML (but preserve URLs)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Images - must be before links! ![alt](url)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0; display: block;">')
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #ffffff; text-decoration: underline;">$1</a>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Line breaks to paragraphs
    .split(/\n\n+/)
    .map(block => {
      block = block.trim()
      if (!block) return ''
      if (block.startsWith('<h') || block.startsWith('<li>') || block.startsWith('<img')) return block
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

// Logo hosted publicly - white logo on black background
const LOGO_URL = `${BASE_URL}/BUSY_LOGO%20TRANSPARENTE-3.png`

/**
 * Create campaign email HTML template
 * Minimalist design optimized for deliverability
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

  // CTA Button
  const ctaButton = (params.ctaText && params.ctaUrl) ? `
    <div style="text-align: center; padding: 24px 0 8px 0;">
      <a href="${params.ctaUrl}" target="_blank" style="display: inline-block; background-color: #ffffff; color: #000000; text-decoration: none; padding: 12px 28px; font-weight: 600; font-size: 14px; letter-spacing: 0.5px;">
        ${params.ctaText}
      </a>
    </div>
  ` : ''

  // Christmas message (subtle, at the bottom)
  const christmasMessage = params.isChristmas ? `
    <div style="text-align: center; padding: 16px 0; border-top: 1px solid #333333;">
      <span style="color: #888888; font-size: 13px;">✨ Felices fiestas de parte del equipo Busy ✨</span>
    </div>
  ` : ''

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <meta name="color-scheme" content="dark only">
  <meta name="supported-color-schemes" content="dark only">
  <title>${params.subject}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    :root { color-scheme: dark only; supported-color-schemes: dark only; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #ffffff !important;
      background-color: #000000 !important;
      margin: 0;
      padding: 0;
    }
    @media (prefers-color-scheme: light) {
      body, .email-wrapper, .email-container { background-color: #000000 !important; }
    }
    @media (prefers-color-scheme: dark) {
      body, .email-wrapper, .email-container { background-color: #000000 !important; }
    }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    a { color: #ffffff; }
  </style>
</head>
<body style="background-color: #000000 !important; margin: 0; padding: 0;" bgcolor="#000000">
  <!-- Wrapper table for full-width black background -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #000000 !important;" bgcolor="#000000">
    <tr>
      <td align="center" style="background-color: #000000 !important;" bgcolor="#000000">
        <!-- Content table -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #000000 !important;" bgcolor="#000000">

          <!-- Header with Logo -->
          <tr>
            <td align="center" style="padding: 32px 24px 24px 24px; background-color: #000000;" bgcolor="#000000">
              <a href="${BASE_URL}" target="_blank">
                <img src="${LOGO_URL}" alt="BUSY" style="height: 40px; width: auto; display: block;">
              </a>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 0 24px 24px 24px; color: #ffffff; font-size: 15px; line-height: 1.7; background-color: #000000;" bgcolor="#000000">
              ${params.content}
              ${ctaButton}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 24px; background-color: #000000;" bgcolor="#000000">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-top: 1px solid #222222;"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td align="center" style="padding: 24px; background-color: #000000;" bgcolor="#000000">
              <!-- Brand Info -->
              <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #ffffff; letter-spacing: 1px;">BUSY STREETWEAR</p>
              <p style="margin: 0 0 16px 0; font-size: 12px; color: #666666;">Cultura urbana desde Mar del Plata, Argentina</p>

              ${christmasMessage}

              <!-- Quick Links -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 16px 0;">
                <tr>
                  <td style="padding: 0 8px;"><a href="${BASE_URL}/products" style="color: #888888; text-decoration: none; font-size: 11px;">TIENDA</a></td>
                  <td style="padding: 0 8px;"><a href="${BASE_URL}/blog" style="color: #888888; text-decoration: none; font-size: 11px;">BLOG</a></td>
                  <td style="padding: 0 8px;"><a href="${BASE_URL}/playlists" style="color: #888888; text-decoration: none; font-size: 11px;">PLAYLISTS</a></td>
                  <td style="padding: 0 8px;"><a href="${BASE_URL}/about" style="color: #888888; text-decoration: none; font-size: 11px;">NOSOTROS</a></td>
                </tr>
              </table>

              <!-- Social Icons -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 8px 0 16px 0;">
                <tr>
                  <td style="padding: 0 6px;"><a href="https://instagram.com/busy_streetwear" target="_blank" style="text-decoration: none; color: #666666; font-size: 12px;">IG</a></td>
                  <td style="color: #333333;">·</td>
                  <td style="padding: 0 6px;"><a href="https://tiktok.com/@busy_streetwear" target="_blank" style="text-decoration: none; color: #666666; font-size: 12px;">TK</a></td>
                  <td style="color: #333333;">·</td>
                  <td style="padding: 0 6px;"><a href="https://youtube.com/@busystreetwear" target="_blank" style="text-decoration: none; color: #666666; font-size: 12px;">YT</a></td>
                  <td style="color: #333333;">·</td>
                  <td style="padding: 0 6px;"><a href="https://open.spotify.com/user/agustinmancho" target="_blank" style="text-decoration: none; color: #666666; font-size: 12px;">SP</a></td>
                </tr>
              </table>

              <!-- Legal -->
              <p style="margin: 0; font-size: 10px; color: #444444;">
                © 2024-${currentYear} Busy Streetwear · María Curie 5457, Mar del Plata
              </p>

              <!-- Unsubscribe -->
              <p style="margin: 12px 0 0 0; font-size: 10px; color: #444444;">
                <a href="${BASE_URL}/newsletter/unsubscribe?email={{email}}" style="color: #555555; text-decoration: underline;">Cancelar suscripción</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

/**
 * Generate preview HTML for a campaign (exported for preview endpoint)
 */
export function generatePreviewHtml(params: {
  subject: string
  content: string
  campaignName: string
  isChristmas?: boolean
  ctaText?: string
  ctaUrl?: string
}): string {
  const htmlContent = markdownToHtml(params.content)
  return createCampaignEmailHtml({
    ...params,
    content: htmlContent,
  })
}
