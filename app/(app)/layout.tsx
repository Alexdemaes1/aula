import Link from 'next/link'
import { requireUser } from '@/lib/auth'
import { LogoutButton } from '@/components/logout-button'
import { Separator } from '@/components/ui/separator'
import { buttonVariants } from '@/components/ui/button'
import { User } from 'lucide-react'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="font-semibold text-sm">
            Mini-LMS
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block truncate max-w-[180px]">
              {user.email}
            </span>
            <Separator orientation="vertical" className="h-5 hidden sm:block" />
            <Link href="/account" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
              <User className="size-4" />
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
