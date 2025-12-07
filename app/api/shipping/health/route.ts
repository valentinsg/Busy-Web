/**
 * Envia.com Health Check Endpoint
 * GET /api/shipping/health
 *
 * Returns detailed status of Envia integration
 */

import { getEnviaClient } from "@/lib/envia"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const envia = getEnviaClient()

  const status = {
    timestamp: new Date().toISOString(),
    configured: envia.isConfigured(),
    healthCheck: null as Awaited<ReturnType<typeof envia.healthCheck>> | null,
    origin: envia.getOriginAddress(),
    envVars: {
      ENVIA_API_KEY: process.env.ENVIA_API_KEY ? `${process.env.ENVIA_API_KEY.substring(0, 8)}...` : "NOT SET",
      ENVIA_API_URL: process.env.ENVIA_API_URL || "https://api.envia.com (default)",
    },
  }

  if (status.configured) {
    status.healthCheck = await envia.healthCheck()
  }

  return NextResponse.json(status)
}
