import Link from 'next/link'
import Image from 'next/image'
import { buttonVariants } from '@/components/ui/button'
import { MobileMenu } from '@/components/mobile-menu'
import { AccountMenu } from '@/components/account-menu'
import { NavLink } from '@/components/nav-link'

interface GlobalNavProps {
  isLoggedIn: boolean
  isAdmin: boolean
  email?: string
}

/** Barra de navegación global, idéntica en público, app y admin. */
export function GlobalNav({ isLoggedIn, isAdmin, email }: GlobalNavProps) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <Image src="/logo.png" alt="Tian Ying Fa" width={32} height={32} className="size-8 object-contain" priority />
          <div className="leading-tight">
            <span className="font-bold text-sm tracking-tight font-heading block">Tian Ying Fa</span>
            <span className="text-[9px] text-muted-foreground tracking-widest uppercase hidden sm:block">
              Centro de salud natural
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          {/* Enlaces primarios (desktop) */}
          <nav className="hidden sm:flex items-center gap-0.5 mr-1">
            <NavLink href="/cursos">Cursos</NavLink>
            <NavLink href="/about">El centro</NavLink>
            {isLoggedIn && <NavLink href="/dashboard">Mi formación</NavLink>}
          </nav>

          {/* Lado derecho (desktop) */}
          {isLoggedIn ? (
            <div className="hidden sm:block">
              <AccountMenu isAdmin={isAdmin} email={email} />
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1">
              <Link href="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                Entrar
              </Link>
              <Link href="/register" className={buttonVariants({ size: 'sm' })}>
                Comenzar
              </Link>
            </div>
          )}

          {/* Móvil: hamburguesa para todos */}
          <MobileMenu isLoggedIn={isLoggedIn} isAdmin={isAdmin} email={email} />
        </div>
      </div>
    </header>
  )
}
