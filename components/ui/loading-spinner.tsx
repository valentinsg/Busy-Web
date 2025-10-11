import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  /**
   * Tamaño del spinner
   * @default "default"
   */
  size?: "sm" | "default" | "lg"
  /**
   * Texto principal a mostrar
   * @default "Cargando..."
   */
  text?: string
  /**
   * Texto secundario (más pequeño y con menos contraste)
   */
  subtext?: string
  /**
   * Si true, ocupa toda la pantalla con fondo
   * @default false
   */
  fullScreen?: boolean
  /**
   * Clases adicionales para el contenedor
   */
  className?: string
}

const sizeClasses = {
  sm: "h-5 w-5",
  default: "h-8 w-8",
  lg: "h-12 w-12",
}

export function LoadingSpinner({
  size = "default",
  text = "Cargando...",
  subtext,
  fullScreen = false,
  className,
}: LoadingSpinnerProps) {
  const content = (
    <div className="text-center">
      <RefreshCw className={cn(sizeClasses[size], "animate-spin mx-auto mb-4 text-primary")} />
      <p className="text-sm font-medium text-foreground">{text}</p>
      {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center bg-muted/30", className)}>
        {content}
      </div>
    )
  }

  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      {content}
    </div>
  )
}
