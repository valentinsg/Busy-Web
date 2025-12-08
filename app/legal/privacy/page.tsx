import { generateSEO } from "@/lib/seo"
import type { Metadata } from "next"

export const metadata: Metadata = generateSEO({
  title: "Política de Privacidad - Busy",
  description:
    "Cómo Busy recopila, utiliza y protege tu información personal. Transparencia y control para nuestros usuarios.",
  url: `${process.env.SITE_URL || "https://busy.com.ar"}/legal/privacy`,
})

export default function PrivacyPage() {
  const lastUpdated = new Date().toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "2-digit" })
  return (
    <div className="container px-4 py-8 pt-28">
      <div className="max-w-4xl mx-auto prose prose-neutral dark:prose-invert">
        <h1>Política de Privacidad</h1>
        <p className="text-muted-foreground">Última actualización: {lastUpdated}</p>

        <h2>Información que recopilamos</h2>
        <p>
          Recopilamos la información que nos brindás directamente (por ejemplo, cuando hacés una compra o nos
          contactás) y datos técnicos de uso del sitio (por ejemplo, cookies y analíticas).
        </p>

        <h2>Cómo usamos tu información</h2>
        <p>Utilizamos la información para:</p>
        <ul>
          <li>Procesar y despachar tus pedidos.</li>
          <li>Comunicarnos sobre tu cuenta o transacciones.</li>
          <li>Brindar soporte al cliente.</li>
          <li>Enviar comunicaciones de marketing (con tu consentimiento).</li>
          <li>Mejorar nuestros productos, servicios y experiencia del sitio.</li>
        </ul>

        <h2>Compartir información</h2>
        <p>
          No vendemos ni compartimos tu información personal con terceros sin tu consentimiento, salvo proveedores que
          nos ayudan a operar el sitio (por ejemplo, plataformas de pago y logística) y solo para los fines indicados.
        </p>

        <h2>Seguridad de los datos</h2>
        <p>
          Implementamos medidas razonables para proteger tu información contra accesos no autorizados, alteración o
          divulgación.
        </p>

        <h2>Tus derechos</h2>
        <ul>
          <li>Acceder, corregir o eliminar tus datos personales.</li>
          <li>Retirar el consentimiento para comunicaciones de marketing.</li>
          <li>Configurar tus preferencias de cookies en tu navegador.</li>
        </ul>

        <h2>Contacto</h2>
        <p>
          Si tenés dudas sobre esta política, escribinos a {" "}
          <a href="mailto:busystreetwear@gmail.com" className="text-accent-brand hover:underline">busystreetwear@gmail.com</a>. También podés consultar nuestras <a href="/faq" className="text-accent-brand hover:underline">preguntas frecuentes</a>.
        </p>
      </div>
    </div>
  )
}
