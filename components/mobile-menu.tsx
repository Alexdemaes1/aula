'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileMenuProps {
  isLoggedIn: boolean
}

const publicLinks = [
  { href: '/cursos', label: 'Cursos' },
  { href: '/about', label: 'El centro' },
]

const authLinks = [
  { href: '/login', label: 'Entrar' },
  { href: '/register', label: 'Comenzar gratis' },
]

export function MobileMenu({ isLoggedIn }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  if (isLoggedIn) return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="sm:hidden flex items-center justify-center size-9 rounded-md hover:bg-accent transition-colors"
        aria-label="Abrir menú"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
      >
        <Menu className="size-5" />
      </button>

      {open && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/30 sm:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          {/* Panel */}
          <div id="mobile-nav-panel" className="fixed top-0 right-0 z-50 h-full w-64 bg-background border-l shadow-xl sm:hidden flex flex-col" role="dialog" aria-modal="true" aria-label="Menú de navegación">
            <div className="flex items-center justify-between px-4 h-14 border-b">
              <span className="font-semibold font-heading text-sm">Menú</span>
              <button
                onClick={() => setOpen(false)}
                className="flex items-center justify-center size-9 rounded-md hover:bg-accent transition-colors"
                aria-label="Cerrar menú"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {publicLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center px-3 py-2.5 rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t space-y-2">
              {authLinks.map(({ href, label }, i) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center justify-center w-full px-4 py-2.5 rounded-md text-sm font-medium transition-colors',
                    i === 0
                      ? 'border hover:bg-accent'
                      : 'bg-primary text-primary-foreground hover:opacity-90'
                  )}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}
