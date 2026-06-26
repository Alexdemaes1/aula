'use client'

import { useRouter } from 'next/navigation'
import { LogOut, Settings, LayoutDashboard, UserCircle } from 'lucide-react'
import { logoutAction } from '@/app/actions/auth'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

/** Menú de cuenta (avatar arriba-derecha), consistente en público y área de alumno. */
export function AccountMenu({
  isAdmin,
  email,
  variant = 'public',
}: {
  isAdmin: boolean
  email?: string
  variant?: 'public' | 'student'
}) {
  const router = useRouter()
  const initial = (email?.trim()?.[0] ?? 'U').toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex items-center justify-center size-9 rounded-full font-heading text-base font-semibold outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring',
          variant === 'student'
            ? 'bg-brand-gold text-brand-dark'
            : 'bg-cream text-primary border border-brand-gold/40'
        )}
        aria-label="Menú de cuenta"
      >
        {initial}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-56">
        {email && (
          <>
            {/* div simple, NO DropdownMenuLabel: GroupLabel de base-ui exige un <Group> padre (error #31) */}
            <div className="px-1.5 py-1 text-xs font-medium text-muted-foreground truncate">{email}</div>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={() => router.push('/dashboard')}>
          <LayoutDashboard /> Mi formación
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/account')}>
          <UserCircle /> Mi cuenta
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem onClick={() => router.push('/admin')}>
            <Settings /> Administración
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => logoutAction()}>
          <LogOut /> Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
