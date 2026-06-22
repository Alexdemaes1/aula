'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Loader2 } from 'lucide-react'

interface BuyButtonProps {
  courseId: string
  price: string
}

export function BuyButton({ courseId, price }: BuyButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleBuy() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Error al iniciar el pago')
        return
      }
      window.location.href = data.url
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button className="w-full" onClick={handleBuy} disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            Redirigiendo…
          </>
        ) : (
          <>
            <ShoppingCart className="size-4 mr-2" />
            Comprar — {price}
          </>
        )}
      </Button>
      {error && <p className="text-xs text-destructive text-center">{error}</p>}
    </div>
  )
}
