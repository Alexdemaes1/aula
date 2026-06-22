import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users, ShoppingBag, TrendingUp } from 'lucide-react'
import { formatPrice } from '@/lib/utils/format'
import Link from 'next/link'

export const metadata = { title: 'Panel de administración' }

export default async function AdminPage() {
  const db = createAdminClient()

  const [
    { count: coursesCount },
    { count: usersCount },
    { count: enrollmentsCount },
    { data: revenue },
    { data: recentPurchases },
  ] = await Promise.all([
    db.from('courses').select('*', { count: 'exact', head: true }),
    db.from('profiles').select('*', { count: 'exact', head: true }),
    db.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    db.from('enrollments').select('amount_paid_cents').eq('status', 'active'),
    db.from('enrollments')
      .select('purchased_at, amount_paid_cents, courses(title), profiles(full_name, id)')
      .order('purchased_at', { ascending: false })
      .limit(5),
  ])

  const totalRevenue = revenue?.reduce((sum, e) => sum + (e.amount_paid_cents ?? 0), 0) ?? 0

  const stats = [
    { label: 'Cursos', value: coursesCount ?? 0, icon: BookOpen, href: '/admin/courses' },
    { label: 'Usuarios', value: usersCount ?? 0, icon: Users, href: '/admin/users' },
    { label: 'Matrículas', value: enrollmentsCount ?? 0, icon: ShoppingBag, href: '/admin/purchases' },
    { label: 'Ingresos', value: formatPrice(totalRevenue), icon: TrendingUp, href: '/admin/purchases' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Panel de administración</h1>
        <p className="text-muted-foreground">Resumen de la plataforma</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Últimas compras</CardTitle>
        </CardHeader>
        <CardContent>
          {!recentPurchases?.length ? (
            <p className="text-sm text-muted-foreground">Todavía no hay compras.</p>
          ) : (
            <div className="space-y-3">
              {recentPurchases.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{(p.profiles as any)?.full_name || 'Usuario'}</span>
                    <span className="text-muted-foreground"> compró </span>
                    <span className="font-medium">{(p.courses as any)?.title}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatPrice(p.amount_paid_cents)}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(p.purchased_at).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
