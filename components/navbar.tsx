import Link from 'next/link'
import Image from 'next/image'
import { unstable_cache } from 'next/cache'
import { getUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { buttonVariants } from '@/components/ui/button'
import { LogoutButton } from '@/components/logout-button'
import { Separator } from '@/components/ui/separator'
import { LayoutDashboard, Settings } from 'lucide-react'

function getCachedUserRole(userId: string) {
  return unstable_cache(
    async () => {
      const supabase = createAdminClient()
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()
      return data?.role ?? null
    },
    [`profile-role-${userId}`],
    { revalidate: 60 }
  )()
}

export async function Navbar() {
  const user = await getUser()
  let isAdmin = false

  if (user) {
    const role = await getCachedUserRole(user.id)
    isAdmin = role === 'admin'
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Tian Ying Fa" width={32} height={32} className="size-8 object-contain" priority />
          <div className="leading-tight">
            <span className="font-bold text-sm tracking-tight font-heading block">Tian Ying Fa</span>
            <span className="text-[9px] text-muted-foreground tracking-widest uppercase hidden sm:block">Centro de salud natural</span>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          {user ? (
            <>
              <Link href="/dashboard" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                <LayoutDashboard className="size-4 mr-1.5" />
                Mi formación
              </Link>
              {isAdmin && (
                <>
                  <Separator orientation="vertical" className="h-5 mx-1" />
                  <Link href="/admin" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                    <Settings className="size-4 mr-1.5" />
                    Admin
                  </Link>
                </>
              )}
              <Separator orientation="vertical" className="h-5 mx-1" />
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/about" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                El centro
              </Link>
              <Link href="/#cursos" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                Cursos
              </Link>
              <Link href="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                Entrar
              </Link>
              <Link href="/register" className={buttonVariants({ size: 'sm' })}>
                Comenzar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
