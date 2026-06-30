'use client'

import Link from 'next/link'
import { LogOut, Settings, UserCircle } from 'lucide-react'
import { logoutAction } from '@/app/actions/auth'
import { cn } from '@/lib/utils'
import { UserAvatar } from '@/components/user-avatar'
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
  fullName,
  avatarUrl,
  variant = 'public',
}: {
  isAdmin: boolean
  email?: string
  fullName?: string
  avatarUrl?: string | null
  variant?: 'public' | 'student'
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-full outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Menú de cuenta"
      >
        <UserAvatar
          name={fullName}
          email={email}
          avatarUrl={avatarUrl}
          className={cn(
            'size-9 text-sm',
            variant === 'student'
              ? 'bg-brand-gold text-brand-dark'
              : 'bg-cream text-primary border border-brand-gold/40'
          )}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-60">
        <div className="flex items-center gap-2.5 px-1.5 py-1.5">
          <UserAvatar
            name={fullName}
            email={email}
            avatarUrl={avatarUrl}
            className="size-9 text-sm bg-primary/10 text-primary border border-border shrink-0"
          />
          <div className="min-w-0">
            {fullName && <p className="text-sm font-medium truncate">{fullName}</p>}
            {email && <p className="text-xs text-muted-foreground truncate">{email}</p>}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/account" />}>
          <UserCircle /> Mi cuenta
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem render={<Link href="/admin" />}>
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
