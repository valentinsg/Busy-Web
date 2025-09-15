"use client"

import { Button } from "@/components/ui/button"

export default function EditorToolbar({ onInsert }: { onInsert: (text: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 mb-2">
      <Button type="button" variant="outline" size="sm" onClick={() => onInsert("**texto**")}>Bold</Button>
      <Button type="button" variant="outline" size="sm" onClick={() => onInsert("*texto*")}>Italic</Button>
      <Button type="button" variant="outline" size="sm" onClick={() => onInsert("<u>texto</u>")}>Underline</Button>
      <Button type="button" variant="outline" size="sm" onClick={() => onInsert("## Título H2\n")}>H2</Button>
      <Button type="button" variant="outline" size="sm" onClick={() => onInsert("### Título H3\n")}>H3</Button>
      <Button type="button" variant="outline" size="sm" onClick={() => onInsert("\n\n")}>Espacio</Button>
      <Button type="button" variant="outline" size="sm" onClick={() => onInsert("\n> Cita de ejemplo\n> segunda línea opcional\n\n")}>Cita</Button>
      <Button type="button" variant="outline" size="sm" onClick={() => onInsert("\n1. Paso uno\n2. Paso dos\n3. Paso tres\n\n")}>Snippet numerado</Button>
      <Button type="button" variant="outline" size="sm" onClick={() => onInsert("\n| Columna A | Columna B | Columna C |\n|-----------|-----------|-----------|\n| A1        | B1        | C1        |\n| A2        | B2        | C2        |\n\n")}>Tabla</Button>
      <Button type="button" variant="outline" size="sm" onClick={() => {
        const url = window.prompt("URL de la imagen") || ""
        const alt = window.prompt("Texto alternativo (alt)") || "imagen"
        if (url) onInsert(`![${alt}](${url})\n`)
      }}>Imagen</Button>
    </div>
  )
}
