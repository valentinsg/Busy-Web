// =====================================================
// TEST EMAIL API ENDPOINT
// Endpoint para probar el sistema de emails
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { sendTestEmail, getEmailStats } from '@/lib/email/send'
import { isEmailConfigured } from '@/lib/email/resend'

export const dynamic = 'force-dynamic'

/**
 * GET /api/email/test
 * Send a test email to verify the system is working
 */
export async function GET(request: NextRequest) {
  try {
    // Check if email system is configured
    if (!isEmailConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email system not configured. Please set RESEND_API_KEY in .env.local',
        },
        { status: 500 }
      )
    }

    // Get optional recipient from query params
    const { searchParams } = new URL(request.url)
    const to = searchParams.get('to') || undefined

    // Send test email
    const result = await sendTestEmail(to)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      )
    }

    // Get email stats
    const stats = await getEmailStats()

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      messageId: result.messageId,
      recipient: to || 'admin',
      stats,
    })
  } catch (error: unknown) {
    console.error('Error in test email endpoint:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/email/test
 * Send a test email with custom recipient
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to } = body

    if (!to || typeof to !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid "to" field',
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format',
        },
        { status: 400 }
      )
    }

    // Send test email
    const result = await sendTestEmail(to)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${to}`,
      messageId: result.messageId,
    })
  } catch (error: unknown) {
    console.error('Error in test email endpoint:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
