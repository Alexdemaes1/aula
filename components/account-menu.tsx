'use client'

import { useRouter } from 'next/navigation'
import { User, LogOut, Settings, LayoutDashboard, UserCircle } from 'lucide-react'
import { logoutAction } from '@/app/actions/auth'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

/** Menú de cuenta (arriba-derecha), consistente en todas las zonas. */
export function AccountMenu({ isAdmin, email }: { isAdmin: boolean; email?: string }) {
  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center justify-center size-9 rounded-full hover:bg-accent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Menú de cuenta"
      >
        <User className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-56">
        {email && (
          <>
            {/* div simple, NO DropdownMenuLabel: GroupLabel de base-ui exige un <Group> padre (error #31) */}
            <div className="px-1.5 py-1 text-xs font-medium text-muted-foreground truncate">{email}</div>
            <DropdownMenuSeparator />
          </>
        )}
        {/* onClick + router.push: navegación fiable con el manejo de teclado de @base-ui */}
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
