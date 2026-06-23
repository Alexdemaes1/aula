import Link from 'next/link'
import Image from 'next/image'
import { requireUser } from '@/lib/auth'
import { LogoutButton } from '@/components/logout-button'
import { Separator } from '@/components/ui/separator'
import { buttonVariants } from '@/components/ui/button'
import { LayoutDashboard } from 'lucide-react'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

          {/* Logo → inicio */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Tian Ying Fa" width={28} height={28} className="size-7 object-contain" priority />
            <span className="font-semibold text-sm font-heading hidden xs:block">Tian Ying Fa</span>
          </Link>

          {/* Navegación y acciones */}
          <div className="flex items-center gap-1">
            <Link href="/cursos" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
              Cursos
            </Link>
            <Link href="/dashboard" className={`${buttonVariants({ variant: 'ghost', size: 'sm' })} hidden sm:inline-flex`}>
              <LayoutDashboard className="size-4 mr-1.5" />
              Mi formación
            </Link>
            <Link href="/account" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
              Mi cuenta
            </Link>
            <Separator orientation="vertical" className="h-5 mx-1 hidden sm:block" />
            <span className="text-sm text-muted-foreground hidden lg:block truncate max-w-[160px]">
              {user.email}
            </span>
            <Separator orientation="vertical" className="h-5 mx-1 hidden lg:block" />
            <LogoutButton />
          </div>
        </div>
      </header>
      <main id="main-content" className="flex-1">{children}</main>
    </div>
  )
}
