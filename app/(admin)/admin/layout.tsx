import { requireAdmin } from '@/lib/auth'
import { GlobalNav } from '@/components/global-nav'
import { getNavData } from '@/lib/nav-data'
import { AdminNav } from '@/components/admin/admin-nav'
import { Settings } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  const nav = await getNavData()

  return (
    <div className="min-h-screen flex flex-col">
      <GlobalNav {...nav} />
      <div className="flex flex-1 min-h-0">
        {/* Sidebar de secciones de admin */}
        <aside className="w-56 flex-shrink-0 border-r bg-muted/30 flex flex-col sticky top-14 h-[calc(100vh-3.5rem)]">
          <div className="h-12 flex items-center px-4 border-b gap-2 font-bold text-sm">
            <Settings className="size-4" />
            Administración
          </div>
          <AdminNav />
        </aside>

        {/* Contenido */}
        <div className="flex-1 flex flex-col min-w-0">
          <main id="main-content" className="flex-1 p-8 overflow-auto">{children}</main>
        </div>
      </div>
    </div>
  )
}
