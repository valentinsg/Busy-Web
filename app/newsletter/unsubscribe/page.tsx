'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function UnsubscribePage() {
  const searchParams = useSearchParams()
  const email = searchParams?.get('email') || ''

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleUnsubscribe = async () => {
    if (!email) {
      setStatus('error')
      setMessage('Email no proporcionado')
      return
    }

    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: decodeURIComponent(email) }),
      })

      const json = await res.json()

      if (res.ok && json.ok) {
        setStatus('success')
        setMessage('Te has dado de baja exitosamente. Ya no recibirás más emails de nuestra newsletter.')
      } else {
        setStatus('error')
        setMessage(json.error || 'Error al procesar la solicitud')
      }
    } catch {
      setStatus('error')
      setMessage('Error de conexión. Intenta nuevamente.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="font-heading text-3xl font-bold">Cancelar suscripción</h1>

        {status === 'idle' && (
          <>
            <p className="text-muted-foreground">
              ¿Estás seguro de que querés cancelar tu suscripción a la newsletter de Busy?
            </p>
            {email && (
              <p className="text-sm text-muted-foreground">
                Email: <span className="font-medium text-foreground">{decodeURIComponent(email)}</span>
              </p>
            )}
            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={handleUnsubscribe}
                className="w-full py-3 px-4 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                Sí, cancelar suscripción
              </button>
              <Link
                href="/"
                className="w-full py-3 px-4 border rounded-lg hover:bg-muted transition-colors"
              >
                No, volver al inicio
              </Link>
            </div>
          </>
        )}

        {status === 'loading' && (
          <div className="py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Procesando...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-muted-foreground">{message}</p>
            <Link
              href="/"
              className="inline-block mt-4 py-2 px-4 border rounded-lg hover:bg-muted transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="py-8 space-y-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-destructive">{message}</p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-4 py-2 px-4 border rounded-lg hover:bg-muted transition-colors"
            >
              Intentar nuevamente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
