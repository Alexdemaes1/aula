'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'

interface Props {
  courseId: string
}

export function PurchaseSuccessBanner({ courseId }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<'checking' | 'enrolled' | 'waiting'>('checking')
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const attemptsRef = useRef(0)

  useEffect(() => {
    async function check() {
      attemptsRef.current++
      try {
        const res = await fetch(`/api/enrollment/check?courseId=${courseId}`)
        const data = await res.json()
        if (data.enrolled) {
          setStatus('enrolled')
          router.refresh()
          return
        }
      } catch {}

      // Reintentar hasta 12 veces (~24 segundos)
      if (attemptsRef.current < 12) {
        setStatus('waiting')
        timerRef.current = setTimeout(check, 2000)
      } else {
        setStatus('waiting')
      }
    }

    check()
    return () => clearTimeout(timerRef.current)
  }, [courseId, router])

  return (
    <div className="mb-6 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 flex items-start gap-3">
      {status === 'enrolled' ? (
        <CheckCircle className="size-4 mt-0.5 flex-shrink-0 text-green-600" />
      ) : (
        <Loader2 className="size-4 mt-0.5 flex-shrink-0 animate-spin text-green-600" />
      )}
      <div>
        <p className="font-medium">
          {status === 'enrolled' ? '¡Acceso activado!' : 'Pago recibido. Activando acceso…'}
        </p>
        {status !== 'enrolled' && (
          <p className="text-xs mt-0.5 text-green-700 opacity-80">
            Esto tardará solo unos segundos.
          </p>
        )}
      </div>
    </div>
  )
}
