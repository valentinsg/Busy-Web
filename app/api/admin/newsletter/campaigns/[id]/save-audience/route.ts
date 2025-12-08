import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { assertAdmin } from "../../../../_utils"

const schema = z.object({
  emails: z.array(z.string()).optional(),
  status: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await assertAdmin(req)
  if (!admin.ok) return admin.res
  const svc = admin.svc
  try {
    const body = await req.json()
    const parsed = schema.parse(body)
    const emails = parsed.emails || []

    console.log('[save-audience] Campaign:', params.id, 'Emails received:', emails.length)

    // If emails are provided directly, use those
    if (emails.length > 0) {
      const normalizedEmails = Array.from(new Set(
        emails.map(e => e.trim().toLowerCase()).filter(Boolean)
      ))

      console.log('[save-audience] Normalized emails:', normalizedEmails.length)

      // Verify these emails exist and are subscribed
      const { data: validSubs, error: subErr } = await svc
        .from("newsletter_subscribers")
        .select("email")
        .in("email", normalizedEmails)
        .eq("status", "subscribed")

      if (subErr) {
        console.error('[save-audience] Error fetching subscribers:', subErr)
        throw subErr
      }

      const validEmails = (validSubs || []).map(s => s.email.toLowerCase())
      console.log('[save-audience] Valid subscribed emails:', validEmails.length)

      // Save recipients - delete old ones first, then insert new
      if (validEmails.length > 0) {
        // Delete existing recipients for this campaign
        await svc
          .from("newsletter_campaign_recipients")
          .delete()
          .eq("campaign_id", params.id)

        // Insert new recipients
        const rows = validEmails.map(email => ({
          campaign_id: params.id,
          email,
          status: 'ready'
        }))
        const { error: insertErr } = await svc
          .from("newsletter_campaign_recipients")
          .insert(rows)

        if (insertErr) {
          console.error('[save-audience] Error inserting recipients:', insertErr)
          throw insertErr
        }
      }

      return NextResponse.json({ ok: true, saved: validEmails.length })
    }

    // No emails provided
    return NextResponse.json({ ok: true, saved: 0 })
  } catch (e: unknown) {
    console.error('[save-audience] Error:', e)
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 400 })
  }
}
