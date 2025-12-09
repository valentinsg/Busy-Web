import getServiceClient from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

/**
 * Resend Webhook Handler
 * Receives events: delivered, opened, clicked, bounced, complained, unsubscribed
 *
 * Setup in Resend Dashboard:
 * 1. Go to Webhooks
 * 2. Add endpoint: https://busy.com.ar/api/webhooks/resend
 * 3. Select events: email.delivered, email.opened, email.clicked, email.bounced, email.complained
 * 4. Copy the signing secret to RESEND_WEBHOOK_SECRET env var
 */

const WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET

// Event types we care about
type ResendEventType =
  | 'email.sent'
  | 'email.delivered'
  | 'email.opened'
  | 'email.clicked'
  | 'email.bounced'
  | 'email.complained'
  | 'email.delivery_delayed'

interface ResendWebhookPayload {
  type: ResendEventType
  created_at: string
  data: {
    email_id: string
    from: string
    to: string[]
    subject: string
    click?: {
      link: string
      timestamp: string
      userAgent: string
      ipAddress: string
    }
    open?: {
      timestamp: string
      userAgent: string
      ipAddress: string
    }
    bounce?: {
      message: string
    }
    tags?: {
      campaign_id?: string
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()

    // Verify webhook signature if secret is configured
    if (WEBHOOK_SECRET) {
      const signature = req.headers.get('svix-signature')
      const timestamp = req.headers.get('svix-timestamp')
      const id = req.headers.get('svix-id')

      if (!signature || !timestamp || !id) {
        console.warn('[resend-webhook] Missing signature headers')
        return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
      }

      // TODO: Implement proper SVIX signature verification
      // For now, we'll trust the request if it has the headers
    }

    const payload: ResendWebhookPayload = JSON.parse(body)
    console.log('[resend-webhook] Received event:', payload.type)

    // Map Resend event type to our event type
    const eventTypeMap: Record<string, string> = {
      'email.sent': 'sent',
      'email.delivered': 'delivered',
      'email.opened': 'opened',
      'email.clicked': 'clicked',
      'email.bounced': 'bounced',
      'email.complained': 'complained',
      'email.delivery_delayed': 'delayed',
    }

    const eventType = eventTypeMap[payload.type]
    if (!eventType) {
      console.log('[resend-webhook] Ignoring event type:', payload.type)
      return NextResponse.json({ ok: true, ignored: true })
    }

    const email = payload.data.to[0]
    const subject = payload.data.subject

    // Try to find the campaign by subject (we include campaign info in subject)
    // Or use tags if available
    const svc = getServiceClient()

    let campaignId = payload.data.tags?.campaign_id

    if (!campaignId) {
      // Try to find campaign by subject match
      const { data: campaigns } = await svc
        .from('newsletter_campaigns')
        .select('id')
        .eq('subject', subject)
        .order('created_at', { ascending: false })
        .limit(1)

      if (campaigns && campaigns.length > 0) {
        campaignId = campaigns[0].id
      }
    }

    if (!campaignId) {
      console.log('[resend-webhook] Could not find campaign for subject:', subject)
      return NextResponse.json({ ok: true, no_campaign: true })
    }

    // Extract additional data based on event type
    let linkUrl: string | null = null
    let userAgent: string | null = null
    let ipAddress: string | null = null
    const metadata: Record<string, unknown> = {}

    if (payload.type === 'email.clicked' && payload.data.click) {
      linkUrl = payload.data.click.link
      userAgent = payload.data.click.userAgent
      ipAddress = payload.data.click.ipAddress
    } else if (payload.type === 'email.opened' && payload.data.open) {
      userAgent = payload.data.open.userAgent
      ipAddress = payload.data.open.ipAddress
    } else if (payload.type === 'email.bounced' && payload.data.bounce) {
      metadata.bounce_message = payload.data.bounce.message
    }

    // Insert event
    const { error: insertError } = await svc
      .from('newsletter_campaign_events')
      .insert({
        campaign_id: campaignId,
        email,
        event_type: eventType,
        link_url: linkUrl,
        user_agent: userAgent,
        ip_address: ipAddress ? anonymizeIp(ipAddress) : null,
        metadata,
      })

    if (insertError) {
      // Ignore duplicate events
      if (insertError.code === '23505') {
        console.log('[resend-webhook] Duplicate event ignored')
        return NextResponse.json({ ok: true, duplicate: true })
      }
      console.error('[resend-webhook] Insert error:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Auto-unsubscribe on complaint (spam report) or bounce
    if (eventType === 'complained' || eventType === 'bounced') {
      console.log(`[resend-webhook] Auto-unsubscribing ${email} due to ${eventType}`)
      await svc
        .from('newsletter_subscribers')
        .update({
          status: eventType === 'complained' ? 'complained' : 'bounced',
          updated_at: new Date().toISOString()
        })
        .eq('email', email)
    }

    // Note: Campaign stats are calculated from events in the detail page
    // No need to maintain denormalized counters

    console.log('[resend-webhook] Event recorded:', eventType, email)
    return NextResponse.json({ ok: true })

  } catch (e) {
    console.error('[resend-webhook] Error:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Anonymize IP address for privacy (keep first 3 octets for IPv4)
 */
function anonymizeIp(ip: string): string {
  if (ip.includes(':')) {
    // IPv6: keep first 4 groups
    const parts = ip.split(':')
    return parts.slice(0, 4).join(':') + '::'
  } else {
    // IPv4: keep first 3 octets
    const parts = ip.split('.')
    return parts.slice(0, 3).join('.') + '.0'
  }
}

// Handle GET for webhook verification
export async function GET() {
  return NextResponse.json({ ok: true, message: 'Resend webhook endpoint' })
}
