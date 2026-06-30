import Link from 'next/link'
import Image from 'next/image'
import { GraduationCap, ArrowLeft } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { MobileMenu } from '@/components/mobile-menu'
import { AccountMenu } from '@/components/account-menu'
import { NavLink } from '@/components/nav-link'

interface GlobalNavProps {
  isLoggedIn: boolean
  isAdmin: boolean
  email?: string
  fullName?: string
  avatarUrl?: string | null
  /** 'public' = web pública (papel) · 'student' = área de alumno (jade) */
  variant?: 'public' | 'student'
}

/** Barra de navegación global con dos contextos: web pública y área de alumno. */
export function GlobalNav({ isLoggedIn, isAdmin, email, fullName, avatarUrl, variant = 'public' }: GlobalNavProps) {
  if (variant === 'student') {
    return (
      <header className="sticky top-0 z-50 bg-brand-dark text-cream border-b border-brand-gold/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
            <Image src="/logo-cream.png" alt="Tian Ying Fa" width={32} height={32} className="size-8 object-contain" priority />
            <span className="font-heading font-semibold text-lg tracking-tight">Tian Ying Fa</span>
          </Link>

          <div className="flex items-center gap-1">
            <nav className="hidden sm:flex items-center gap-0.5 mr-1">
              <NavLink href="/dashboard" variant="student">Mis cursos</NavLink>
              <NavLink href="/cursos" variant="student">Explorar</NavLink>
            </nav>
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 mr-1 font-mono text-[11px] uppercase tracking-wider text-cream/55 hover:text-cream transition-colors"
            >
              <ArrowLeft className="size-3" /> Web pública
            </Link>
            <div className="hidden sm:block">
              <AccountMenu isAdmin={isAdmin} email={email} fullName={fullName} avatarUrl={avatarUrl} variant="student" />
            </div>
            <MobileMenu isLoggedIn={isLoggedIn} isAdmin={isAdmin} email={email} fullName={fullName} avatarUrl={avatarUrl} variant="student" />
          </div>
        </div>
      </header>
    )
  }

  // Web pública — barra clara sobre papel
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/65">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <Image src="/logo-clean.png" alt="Tian Ying Fa" width={34} height={34} className="size-9 object-contain" priority />
          <div className="leading-none">
            <span className="font-heading font-semibold text-xl tracking-tight block">Tian Ying Fa</span>
            <span className="kicker mt-1 hidden sm:block !text-[8.5px]">Centro de salud natural</span>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          <nav className="hidden sm:flex items-center gap-0.5 mr-1">
            <NavLink href="/cursos">Cursos</NavLink>
            <NavLink href="/#centro">El centro</NavLink>
          </nav>

          {isLoggedIn ? (
            <div className="hidden sm:flex items-center gap-2.5">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 h-9 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <GraduationCap className="size-4 text-brand-gold" /> Mi formación
              </Link>
              <AccountMenu isAdmin={isAdmin} email={email} fullName={fullName} avatarUrl={avatarUrl} variant="public" />
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1">
              <Link href="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                Entrar
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 h-9 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Empezar
              </Link>
            </div>
          )}

          <MobileMenu isLoggedIn={isLoggedIn} isAdmin={isAdmin} email={email} fullName={fullName} avatarUrl={avatarUrl} variant="public" />
        </div>
      </div>
    </header>
  )
}
