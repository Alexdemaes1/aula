import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users, ShoppingBag, TrendingUp, Activity, Star } from 'lucide-react'
import { formatPrice } from '@/lib/utils/format'
import { RevenueChart } from '@/components/admin/revenue-chart'
import Link from 'next/link'

export const metadata = { title: 'Panel de administración' }

export default async function AdminPage() {
  const db = createAdminClient()

  const cutoff48h = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

  const [
    { count: coursesCount },
    { count: usersCount },
    { count: enrollmentsCount },
    { data: revenue },
    { data: recentPurchases },
    { data: monthlyRaw },
    { count: activeUsers },
    { data: completionRaw },
  ] = await Promise.all([
    db.from('courses').select('*', { count: 'exact', head: true }),
    db.from('profiles').select('*', { count: 'exact', head: true }),
    db.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    db.from('enrollments').select('amount_paid_cents').eq('status', 'active'),
    db.from('enrollments')
      .select('purchased_at, amount_paid_cents, courses(title), profiles(full_name, id)')
      .eq('status', 'active')
      .order('purchased_at', { ascending: false })
      .limit(8),
    db.rpc('monthly_revenue') as unknown as Promise<{ data: { month: string; revenue_cents: number; enrollments_count: number }[] | null }>,
    db.from('lesson_progress').select('user_id', { count: 'exact', head: true }).gte('updated_at', cutoff48h),
    db.rpc('global_completion_rate') as unknown as Promise<{ data: { completed_count: number; total_count: number }[] | null }>,
  ])

  const totalRevenue = revenue?.reduce((sum, e) => sum + (e.amount_paid_cents ?? 0), 0) ?? 0

  // Datos de ingresos para el gráfico
  const chartData = (monthlyRaw ?? []).map(r => ({
    month: r.month,
    revenue: Number(r.revenue_cents),
    count: Number(r.enrollments_count),
  }))

  // Métricas del mes actual vs mes anterior
  const thisMonth = chartData[chartData.length - 1]?.revenue ?? 0
  const prevMonth = chartData[chartData.length - 2]?.revenue ?? 0
  const monthDiff = prevMonth > 0 ? Math.round(((thisMonth - prevMonth) / prevMonth) * 100) : null

  // Tasa de finalización global
  const completionRow = completionRaw?.[0]
  const totalProgress = Number(completionRow?.total_count ?? 0)
  const completedProgress = Number(completionRow?.completed_count ?? 0)
  const completionRate = totalProgress > 0 ? Math.round((completedProgress / totalProgress) * 100) : 0

  const stats = [
    { label: 'Cursos', value: coursesCount ?? 0, icon: BookOpen, href: '/admin/courses' },
    { label: 'Usuarios', value: usersCount ?? 0, icon: Users, href: '/admin/users' },
    { label: 'Matrículas', value: enrollmentsCount ?? 0, icon: ShoppingBag, href: '/admin/purchases' },
    { label: 'Ingresos totales', value: formatPrice(totalRevenue), icon: TrendingUp, href: '/admin/purchases' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <p className="kicker mb-1.5">Administración</p>
        <h1 className="font-heading text-3xl font-semibold">Panel de administración</h1>
        <p className="text-muted-foreground mt-0.5">Resumen de la plataforma</p>
      </div>

      {/* Fila 1 — Stats principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-heading text-3xl font-semibold">{value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Fila 2 — Métricas secundarias */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="size-3.5" />
              Ingresos este mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-heading text-3xl font-semibold">{formatPrice(thisMonth)}</div>
            {monthDiff !== null && (
              <p className={`text-xs mt-1 ${monthDiff >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                {monthDiff >= 0 ? '↑' : '↓'} {Math.abs(monthDiff)}% vs mes anterior
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Activity className="size-3.5" />
              Alumnos activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-heading text-3xl font-semibold">{activeUsers ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Últimas 48 horas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Star className="size-3.5" />
              Tasa de finalización
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-heading text-3xl font-semibold">{completionRate}%</div>
            <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${completionRate}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedProgress} / {totalProgress} lecciones vistas completadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fila 3 — Gráfico de ingresos */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ingresos últimos 6 meses</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={chartData} />
          </CardContent>
        </Card>
      )}

      {/* Fila 4 — Actividad reciente */}
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
                    <span className="font-medium">{(p.profiles as unknown as { full_name: string } | null)?.full_name || 'Usuario'}</span>
                    <span className="text-muted-foreground"> compró </span>
                    <span className="font-medium">{(p.courses as unknown as { title: string } | null)?.title}</span>
                  </div>
                  <div className="text-right shrink-0 ml-4">
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
