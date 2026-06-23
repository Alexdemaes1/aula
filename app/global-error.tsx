'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-8 text-center font-sans">
        <h1 className="text-2xl font-bold mb-2">Error inesperado</h1>
        <p className="text-muted-foreground mb-6 text-sm max-w-sm">
          Algo falló en la aplicación. Inténtalo de nuevo.
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Reintentar
        </button>
      </body>
    </html>
  )
}
