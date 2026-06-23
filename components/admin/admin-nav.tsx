'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, LayoutDashboard, Settings2, ShoppingBag, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/admin',           label: 'Panel',        icon: LayoutDashboard, exact: true },
  { href: '/admin/courses',   label: 'Cursos',        icon: BookOpen },
  { href: '/admin/users',     label: 'Usuarios',      icon: Users },
  { href: '/admin/purchases', label: 'Compras',       icon: ShoppingBag },
  { href: '/admin/settings',  label: 'Configuración', icon: Settings2 },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 p-2 space-y-0.5">
      {links.map(({ href, label, icon: Icon, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
