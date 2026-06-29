'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const KEY = 'tyf-cookie-consent'

/** Banner de consentimiento de cookies (UE). Persiste la elección en localStorage. */
export function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true)
    } catch {
      // localStorage no disponible → no mostramos
    }
  }, [])

  function decide(value: 'accepted' | 'rejected') {
    try {
      localStorage.setItem(KEY, value)
    } catch {}
    setShow(false)
  }

  if (!show) return null

  return (
    <div
      role="dialog"
      aria-label="Consentimiento de cookies"
      className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:max-w-md z-[60] rounded-xl border bg-card p-4 shadow-lg"
    >
      <p className="text-sm text-muted-foreground leading-relaxed">
        Usamos cookies propias necesarias para el funcionamiento del sitio y, con tu permiso, para
        contenido embebido (vídeos). Consulta la{' '}
        <Link href="/cookies" className="underline hover:text-foreground">política de cookies</Link>.
      </p>
      <div className="mt-3 flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={() => decide('rejected')}>
          Rechazar
        </Button>
        <Button size="sm" onClick={() => decide('accepted')}>
          Aceptar
        </Button>
      </div>
    </div>
  )
}
