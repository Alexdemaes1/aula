import Link from 'next/link'
import Image from 'next/image'
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
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Tian Ying Fa" width={28} height={28} className="size-7 object-contain" priority />
            <span className="font-semibold text-sm font-heading">Tian Ying Fa</span>
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
