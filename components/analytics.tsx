'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

const DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN

/**
 * Analítica web (Plausible) — solo si está configurado el dominio Y el usuario
 * ha aceptado las cookies. No-op sin NEXT_PUBLIC_PLAUSIBLE_DOMAIN.
 */
export function Analytics() {
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    if (!DOMAIN) return
    const check = () => {
      try {
        setAllowed(localStorage.getItem('tyf-cookie-consent') === 'accepted')
      } catch {}
    }
    check()
    window.addEventListener('storage', check)
    window.addEventListener('tyf-consent', check)
    return () => {
      window.removeEventListener('storage', check)
      window.removeEventListener('tyf-consent', check)
    }
  }, [])

  if (!DOMAIN || !allowed) return null
  return <Script defer data-domain={DOMAIN} src="https://plausible.io/js/script.js" />
}
