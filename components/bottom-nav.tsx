'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GraduationCap, Compass, UserCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/dashboard', label: 'Mis cursos', icon: GraduationCap, exact: true },
  { href: '/cursos', label: 'Explorar', icon: Compass },
  { href: '/account', label: 'Cuenta', icon: UserCircle },
]

/** Barra de pestañas inferior para móvil (área de alumno). */
export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 sm:hidden flex border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      aria-label="Navegación de alumno"
    >
      {items.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors',
              active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
