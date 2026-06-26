'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, BookOpen, LayoutDashboard, User, Settings, LogOut, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { logoutAction } from '@/app/actions/auth'

interface MobileMenuProps {
  isLoggedIn: boolean
  isAdmin?: boolean
  email?: string
  variant?: 'public' | 'student'
}

type LinkItem = { href: string; label: string; icon: React.ElementType | null }

export function MobileMenu({ isLoggedIn, isAdmin, email, variant = 'public' }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const isStudent = variant === 'student'

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const links: LinkItem[] = isStudent
    ? [
        { href: '/dashboard', label: 'Mis cursos', icon: LayoutDashboard },
        { href: '/cursos', label: 'Explorar', icon: BookOpen },
        { href: '/account', label: 'Mi cuenta', icon: User },
        ...(isAdmin ? [{ href: '/admin', label: 'Administración', icon: Settings }] : []),
        { href: '/', label: 'Web pública', icon: Globe },
      ]
    : isLoggedIn
      ? [
          { href: '/cursos', label: 'Cursos', icon: BookOpen },
          { href: '/#centro', label: 'El centro', icon: null },
          { href: '/dashboard', label: 'Mi formación', icon: LayoutDashboard },
          { href: '/account', label: 'Mi cuenta', icon: User },
          ...(isAdmin ? [{ href: '/admin', label: 'Administración', icon: Settings }] : []),
        ]
      : [
          { href: '/cursos', label: 'Cursos', icon: BookOpen },
          { href: '/#centro', label: 'El centro', icon: null },
        ]

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'sm:hidden flex items-center justify-center size-9 rounded-md transition-colors',
          isStudent ? 'text-cream hover:bg-white/10' : 'hover:bg-accent'
        )}
        aria-label="Abrir menú"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
      >
        <Menu className="size-5" />
      </button>

      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 sm:hidden',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Panel deslizante (siempre montado para animar) */}
      <div
        id="mobile-nav-panel"
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-72 flex flex-col shadow-xl transition-transform duration-200 sm:hidden',
          isStudent ? 'bg-brand-dark text-cream border-l border-brand-gold/15' : 'bg-background border-l',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
      >
        <div
          className={cn(
            'flex items-center justify-between px-4 h-14 border-b',
            isStudent ? 'border-brand-gold/15' : ''
          )}
        >
          <span className="font-heading font-semibold text-base">Menú</span>
          <button
            onClick={() => setOpen(false)}
            className={cn(
              'flex items-center justify-center size-9 rounded-md transition-colors',
              isStudent ? 'hover:bg-white/10' : 'hover:bg-accent'
            )}
            aria-label="Cerrar menú"
          >
            <X className="size-5" />
          </button>
        </div>

        {isLoggedIn && email && (
          <div className={cn('px-4 py-3 border-b', isStudent ? 'bg-white/5 border-brand-gold/15' : 'bg-muted/40')}>
            <p className={cn('text-[10px] uppercase tracking-wider mb-0.5', isStudent ? 'text-cream/55' : 'text-muted-foreground')}>
              Conectado como
            </p>
            <p className="text-sm font-medium truncate">{email}</p>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto" aria-label="Navegación principal">
          {links.map(({ href, label, icon: Icon }) => {
            const hasHash = href.includes('#')
            const active = hasHash ? false : href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href + label}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors',
                  isStudent
                    ? active
                      ? 'bg-brand-gold/15 text-cream'
                      : 'text-cream/75 hover:bg-white/10'
                    : active
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {Icon ? (
                  <Icon className={cn('size-4 flex-shrink-0', isStudent ? 'text-brand-gold' : 'text-muted-foreground')} />
                ) : (
                  <span className="size-4 flex-shrink-0" />
                )}
                {label}
              </Link>
            )
          })}
        </nav>

        <div className={cn('p-4 border-t space-y-2', isStudent ? 'border-brand-gold/15' : '')}>
          {isLoggedIn ? (
            <form action={logoutAction}>
              <button
                type="submit"
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors',
                  isStudent ? 'text-red-300 hover:bg-red-500/10' : 'text-destructive hover:bg-destructive/10'
                )}
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
                className="flex items-center justify-center w-full px-4 py-3 rounded-lg text-sm font-medium border hover:bg-accent transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center w-full px-4 py-3 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Empezar gratis
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}
