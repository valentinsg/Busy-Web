import { getEmailConfig, getResendClient, isEmailConfigured } from "@/lib/email/resend"
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

    // Create base email HTML template
    const baseEmailHtml = createCampaignEmailHtml({
      subject: campaign.subject,
      content: htmlContent,
      campaignName: campaign.name,
    })

    // Send emails in batches (Resend has rate limits)
    const BATCH_SIZE = 50
    let sentCount = 0
    let failedCount = 0
    const errors: string[] = []

    for (let i = 0; i < emailsToSend.length; i += BATCH_SIZE) {
      const batch = emailsToSend.slice(i, i + BATCH_SIZE)

      // Send to each recipient individually (for tracking)
      const results = await Promise.allSettled(
        batch.map(async (email) => {
          try {
            // Personalize unsubscribe link for each recipient
            const personalizedHtml = baseEmailHtml.replace(
              '{{email}}',
              encodeURIComponent(email)
            )
            await resend.emails.send({
              from: config.from,
              to: email,
              subject: campaign.subject,
              html: personalizedHtml,
              replyTo: config.replyTo,
            })
            return { email, success: true }
          } catch (err) {
            return { email, success: false, error: err instanceof Error ? err.message : String(err) }
          }
        })
      )

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

/**
 * Create campaign email HTML template
 */
function createCampaignEmailHtml(params: {
  subject: string
  content: string
  campaignName: string
}): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${params.subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: #000000;
      padding: 24px;
      text-align: center;
    }
    .header img {
      height: 40px;
      width: auto;
    }
    .header h1 {
      color: #ffffff;
      font-size: 24px;
      font-weight: 700;
      margin: 0;
      letter-spacing: 2px;
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
    .footer {
      background-color: #f5f5f5;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #666666;
    }
    .footer a {
      color: #666666;
    }
    .unsubscribe {
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>BUSY</h1>
    </div>
    <div class="content">
      ${params.content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Busy Streetwear. Todos los derechos reservados.</p>
      <p>María Curie 5457, Mar del Plata, Argentina</p>
      <p class="unsubscribe">
        <a href="https://busy.com.ar/newsletter/unsubscribe?email={{email}}">Cancelar suscripción</a>
      </p>
    </div>
  </div>
</body>
</html>
`
}
