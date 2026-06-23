import Link from 'next/link'
import { getUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { buttonVariants } from '@/components/ui/button'
import { LogoutButton } from '@/components/logout-button'
import { Separator } from '@/components/ui/separator'
import { BookOpen, LayoutDashboard, Settings } from 'lucide-react'

export async function Navbar() {
  const user = await getUser()
  let isAdmin = false

  if (user) {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = data?.role === 'admin'
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <BookOpen className="size-5" />
          Aula
        </Link>

        <nav className="flex items-center gap-1">
          {user ? (
            <>
              <Link href="/dashboard" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                <LayoutDashboard className="size-4 mr-1.5" />
                Mis cursos
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
              <Link href="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>Entrar</Link>
              <Link href="/register" className={buttonVariants({ size: 'sm' })}>Regístrate</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
