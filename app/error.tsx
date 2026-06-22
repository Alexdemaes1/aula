'use client'

import { useEffect } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <AlertCircle className="size-12 text-destructive/50 mb-4" />
      <h2 className="text-xl font-bold mb-2">Algo salió mal</h2>
      <p className="text-muted-foreground mb-6 text-sm max-w-sm">
        Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.
      </p>
      <div className="flex gap-3">
        <button onClick={reset} className={buttonVariants({ variant: 'default' })}>
          Reintentar
        </button>
        <a href="/" className={buttonVariants({ variant: 'outline' })}>
          Ir al inicio
        </a>
      </div>
    </div>
  )
}
