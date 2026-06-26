'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

/** Enlace primario de la barra global con resaltado de sección activa. */
export function NavLink({
  href,
  children,
  variant = 'public',
}: {
  href: string
  children: React.ReactNode
  variant?: 'public' | 'student'
}) {
  const pathname = usePathname()
  const hasHash = href.includes('#')
  const active = hasHash ? false : href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'px-3 py-1.5 text-sm rounded-md transition-colors',
        variant === 'student'
          ? active
            ? 'bg-brand-gold/15 text-cream font-medium'
            : 'text-cream/65 hover:text-cream'
          : active
            ? 'text-foreground font-medium'
            : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {children}
    </Link>
  )
}
