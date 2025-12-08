import { generateSEO } from "@/lib/seo"
import type { Metadata } from "next"

export const metadata: Metadata = generateSEO({
  title: "Términos y Condiciones - Busy",
  description: "Condiciones para el uso del sitio y la compra de productos Busy.",
  url: `${process.env.SITE_URL || "https://busy.com.ar"}/legal/terms`,
})

export default function TermsPage() {
  const lastUpdated = new Date().toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "2-digit" })
  return (
    <div className="container px-4 py-8 pt-28">
      <div className="max-w-4xl mx-auto prose prose-neutral dark:prose-invert">
        <h1>Términos y Condiciones</h1>
        <p className="text-muted-foreground">Última actualización: {lastUpdated}</p>

        <h2>Aceptación de los términos</h2>
        <p>
          Al acceder y usar este sitio, aceptás estos términos y condiciones. Si no estás de acuerdo, por favor no
          utilices el sitio.
        </p>

        <h2>Productos y disponibilidad</h2>
        <p>
          Todos los productos están sujetos a disponibilidad. Podemos discontinuar productos o modificar detalles sin
          previo aviso.
        </p>

        <h2>Precios y pagos</h2>
        <p>
          Los precios pueden cambiar sin previo aviso. El pago debe realizarse en su totalidad antes del despacho del
          pedido.
        </p>

        <h2>Envíos y devoluciones</h2>
        <p>
          Los tiempos y costos de envío varían según la ubicación. Las devoluciones se aceptan dentro de los 30 días de
          la compra en su estado original, de acuerdo a nuestra política de cambios y devoluciones.
        </p>

        <h2>Limitación de responsabilidad</h2>
        <p>
          Busy no será responsable por daños indirectos, incidentales, especiales, consecuentes o punitivos derivados
          del uso de nuestros productos o servicios.
        </p>

        <h2>Contacto</h2>
        <p>
          Para consultas sobre estos términos, escribinos a {" "}
          <a href="mailto:busystreetwear@gmail.com" className="text-accent-brand hover:underline">busystreetwear@gmail.com</a>.
          También podés consultar nuestras <a href="/faq" className="text-accent-brand hover:underline">preguntas frecuentes</a> o seguirnos en{" "}
          <a href="https://instagram.com/busy.streetwear" target="_blank" rel="noopener noreferrer" className="text-accent-brand hover:underline">Instagram</a>.
        </p>
      </div>
    </div>
  )
}
