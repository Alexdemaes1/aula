import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { LogoutButton } from '@/components/logout-button'
import { AdminNav } from '@/components/admin/admin-nav'
import { Settings } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r bg-muted/30 flex flex-col">
        <div className="h-14 flex items-center px-4 border-b gap-2 font-bold">
          <Settings className="size-4" />
          Admin
        </div>
        <AdminNav />
        <div className="p-3 border-t space-y-2">
          <Link href="/" className="block text-xs text-muted-foreground hover:underline px-3 py-1">
            ← Ver catálogo
          </Link>
          <div className="px-3">
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Contenido */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-8 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
