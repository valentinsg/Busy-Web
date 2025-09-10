import type { Metadata } from "next"
import { generateSEO } from "@/lib/seo"

export const metadata: Metadata = generateSEO({
  title: "Política de Cookies - Busy",
  description: "Cómo usamos cookies y tecnologías similares para mejorar tu experiencia en el sitio.",
  url: `${process.env.SITE_URL || "https://busy.com.ar"}/legal/cookies`,
})

export default function CookiesPage() {
  const lastUpdated = new Date().toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "2-digit" })
  return (
    <div className="container px-4 py-8 pt-20">
      <div className="max-w-4xl mx-auto prose prose-neutral dark:prose-invert">
        <h1>Política de Cookies</h1>
        <p className="text-muted-foreground">Última actualización: {lastUpdated}</p>

        <h2>¿Qué son las cookies?</h2>
        <p>
          Las cookies son archivos de texto pequeños que se guardan en tu dispositivo cuando navegás nuestro sitio. Se
          usan para recordar tus preferencias y mejorar tu experiencia.
        </p>

        <h2>Cómo usamos las cookies</h2>
        <p>Utilizamos cookies para:</p>
        <ul>
          <li>Recordar tus preferencias (idioma, carrito, sesión).</li>
          <li>Mantener tu sesión iniciada.</li>
          <li>Analizar el uso del sitio para mejorarlo.</li>
          <li>Mostrar contenido y ofertas relevantes.</li>
        </ul>

        <h2>Tipos de cookies</h2>
        <h3>Esenciales</h3>
        <p>Necesarias para que el sitio funcione (por ejemplo, inicio de sesión y carrito).</p>

        <h3>Analíticas</h3>
        <p>Nos ayudan a entender cómo navegás el sitio (de forma agregada y anónima).</p>

        <h3>Marketing</h3>
        <p>Permiten personalizar contenidos y medir campañas.</p>

        <h2>Gestión de cookies</h2>
        <p>
          Podés controlar y/o eliminar cookies desde la configuración de tu navegador. Tené en cuenta que bloquear
          algunas cookies puede afectar el funcionamiento del sitio.
        </p>

        <h2>Contacto</h2>
        <p>
          Si tenés preguntas sobre esta política, escribinos a {" "}
          <a href="mailto:contacto@busy.com.ar">contacto@busy.com.ar</a>.
        </p>
      </div>
    </div>
  )
}
