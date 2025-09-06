import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get("title") || "Busy - Premium Streetwear"
    const description = searchParams.get("description") || "Quality craftsmanship meets contemporary design"
    const type = searchParams.get("type") || "website"

    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000",
          backgroundImage: "linear-gradient(45deg, #000 0%, #1a1a1a 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
            textAlign: "center",
          }}
        >
          {/* Logo */}
          <div
            style={{
              fontSize: "72px",
              fontWeight: "bold",
              color: "#fff",
              marginBottom: "20px",
              fontFamily: "system-ui",
            }}
          >
            Busy
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: "#fff",
              marginBottom: "20px",
              maxWidth: "800px",
              lineHeight: 1.2,
              fontFamily: "system-ui",
            }}
          >
            {title}
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: "24px",
              color: "#ccc",
              maxWidth: "600px",
              lineHeight: 1.4,
              fontFamily: "system-ui",
            }}
          >
            {description}
          </div>

          {/* Type Badge */}
          {type !== "website" && (
            <div
              style={{
                marginTop: "30px",
                padding: "8px 16px",
                backgroundColor: "#333",
                color: "#fff",
                borderRadius: "20px",
                fontSize: "16px",
                fontFamily: "system-ui",
              }}
            >
              {type.toUpperCase()}
            </div>
          )}
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    )
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    console.log(message)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}
