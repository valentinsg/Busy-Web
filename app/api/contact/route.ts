import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const RESEND_API_KEY = process.env.RESEND_API_KEY
const EMAIL_FROM = process.env.EMAIL_FROM || "Busy Store <no-reply@busy.com.ar>"
const CONTACT_EMAIL = "busystreetwear@gmail.com"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    // Validar campos requeridos
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      )
    }

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY no está configurado")
      return NextResponse.json(
        { error: "Servicio de email no configurado" },
        { status: 500 }
      )
    }

    const resend = new Resend(RESEND_API_KEY)

    // Crear el HTML del email
    const html = `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 10px;">Nuevo mensaje de contacto</h2>

        <div style="margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>Nombre:</strong> ${name}</p>
          <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 10px 0;"><strong>Asunto:</strong> ${subject || "Sin asunto"}</p>
        </div>

        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Mensaje:</h3>
          <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
          <p>Este mensaje fue enviado desde el formulario de contacto de Busy Streetwear.</p>
          <p>Para responder, envía un email directamente a: ${email}</p>
        </div>
      </div>
    `

    // Enviar el email
    await resend.emails.send({
      from: EMAIL_FROM,
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `[Contacto Web] ${subject || "Nuevo mensaje"}`,
      html,
    })

    return NextResponse.json(
      { message: "Email enviado correctamente" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error al enviar email de contacto:", error)
    return NextResponse.json(
      { error: "Error al enviar el mensaje" },
      { status: 500 }
    )
  }
}
