import { NextRequest, NextResponse } from "next/server"

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  // TODO: Implement refund via Mercado Pago /payments/{id}/refunds and business logic.
  return NextResponse.json({ error: "Not implemented" }, { status: 501 })
}
