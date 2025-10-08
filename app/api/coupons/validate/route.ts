import { NextRequest, NextResponse } from "next/server"
import getServiceClient from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()
    
    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Invalid coupon code" },
        { status: 400 }
      )
    }

    const normalizedCode = code.trim().toUpperCase()
    
    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from("coupons")
      .select("code, percent, active, expires_at, max_uses, used_count")
      .eq("code", normalizedCode)
      .maybeSingle()
    
    if (error) {
      console.error("Error validating coupon:", error)
      return NextResponse.json(
        { error: "Database error" },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: "Coupon not found" },
        { status: 404 }
      )
    }

    // Validate coupon conditions
    if (!data.active) {
      return NextResponse.json(
        { error: "Coupon is not active" },
        { status: 400 }
      )
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Coupon has expired" },
        { status: 400 }
      )
    }

    if (data.max_uses && data.used_count >= data.max_uses) {
      return NextResponse.json(
        { error: "Coupon has reached maximum uses" },
        { status: 400 }
      )
    }

    // Return valid coupon
    return NextResponse.json({
      code: data.code,
      percent: data.percent
    })

  } catch (error) {
    console.error("Error in coupon validation:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
