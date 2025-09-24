import { NextRequest, NextResponse } from "next/server"

export async function POST(_req: NextRequest, _ctx: { params: { id: string } }) {
  // Mark as used to satisfy lint until implemented
  void _req
  void _ctx
  // TODO: Implement refund via Mercado Pago /payments/{id}/refunds and business logic.
  return NextResponse.json({ error: "Not implemented" }, { status: 501 })
}
