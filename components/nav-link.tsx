'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

/** Enlace primario de la barra global con resaltado de sección activa. */
export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
  return (
    <Link
      href={href}
      className={cn(
        'px-3 py-1.5 text-sm rounded-md transition-colors',
        active ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {children}
    </Link>
  )
}
