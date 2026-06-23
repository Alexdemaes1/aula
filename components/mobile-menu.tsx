'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X, BookOpen, LayoutDashboard, User, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { logoutAction } from '@/app/actions/auth'

interface MobileMenuProps {
  isLoggedIn: boolean
  isAdmin?: boolean
  email?: string
}

export function MobileMenu({ isLoggedIn, isAdmin, email }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const navLinks = isLoggedIn
    ? [
        { href: '/cursos', label: 'Cursos', icon: BookOpen },
        { href: '/about', label: 'El centro', icon: null },
        { href: '/dashboard', label: 'Mi formación', icon: LayoutDashboard },
        { href: '/account', label: 'Mi cuenta', icon: User },
        ...(isAdmin ? [{ href: '/admin', label: 'Administración', icon: Settings }] : []),
      ]
    : [
        { href: '/cursos', label: 'Cursos', icon: BookOpen },
        { href: '/about', label: 'El centro', icon: null },
      ]

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
          <div
            className="fixed inset-0 z-40 bg-black/40 sm:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-nav-panel"
            className="fixed top-0 right-0 z-50 h-full w-72 bg-background border-l shadow-xl sm:hidden flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
          >
            {/* Cabecera del panel */}
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

            {/* Email del usuario logueado */}
            {isLoggedIn && email && (
              <div className="px-4 py-3 bg-muted/40 border-b">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Conectado como</p>
                <p className="text-sm font-medium truncate">{email}</p>
              </div>
            )}

            {/* Links de navegación */}
            <nav className="flex-1 p-4 space-y-0.5" aria-label="Navegación principal">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-3.5 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {Icon
                    ? <Icon className="size-4 text-muted-foreground flex-shrink-0" />
                    : <span className="size-4 flex-shrink-0" />
                  }
                  {label}
                </Link>
              ))}
            </nav>

            {/* Botones de acción (login/logout) */}
            <div className="p-4 border-t space-y-2">
              {isLoggedIn ? (
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-3 px-3 py-3.5 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="size-4 flex-shrink-0" />
                    Cerrar sesión
                  </button>
                </form>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center w-full px-4 py-3 rounded-md text-sm font-medium border hover:bg-accent transition-colors"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center w-full px-4 py-3 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    Comenzar gratis
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
