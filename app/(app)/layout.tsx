import { requireUser } from '@/lib/auth'
import { GlobalNav } from '@/components/global-nav'
import { getNavData } from '@/lib/nav-data'
import { BottomNav } from '@/components/bottom-nav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser()
  const nav = await getNavData()

  return (
    <div className="min-h-screen flex flex-col">
      <GlobalNav {...nav} variant="student" />
      <main id="main-content" className="flex-1 pb-16 sm:pb-0">{children}</main>
      <BottomNav />
    </div>
  )
}
