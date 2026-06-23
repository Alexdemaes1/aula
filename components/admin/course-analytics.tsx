import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils/format'

interface CourseAnalyticsProps {
  courseId: string
  enrolledCount: number
}

function fmtTime(secs: number | null) {
  if (!secs) return '—'
  const s = Math.round(Number(secs))
  const m = Math.floor(s / 60)
  const rem = s % 60
  return m > 0 ? `${m}m ${rem}s` : `${rem}s`
}

export async function CourseAnalytics({ courseId, enrolledCount }: CourseAnalyticsProps) {
  const db = createAdminClient()

  const [funnelResult, revenueResult] = await Promise.all([
    db.rpc('course_funnel', { p_course_id: courseId }),
    db.from('enrollments').select('amount_paid_cents').eq('course_id', courseId).eq('status', 'active'),
  ])

  type FunnelRow = { lesson_id: string; position: number; title: string; started: number; completed: number; avg_seconds: number | null }
  const rows = (funnelResult.data ?? []) as FunnelRow[]
  const totalRevenue = revenueResult.data?.reduce((s, r) => s + (r.amount_paid_cents ?? 0), 0) ?? 0
  const maxStarted = Math.max(...rows.map((r: FunnelRow) => Number(r.started)), 1)

  const completedLessons = rows.filter((r: FunnelRow) => Number(r.completed) > 0).length
  const completionRate = rows.length > 0 ? Math.round((completedLessons / rows.length) * 100) : 0

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Alumnos inscritos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{enrolledCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos generados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatPrice(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasa de finalización</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{completionRate}%</p>
            <div className="mt-1 h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${completionRate}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Embudo de lecciones</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6">Sin datos de progreso todavía.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="px-4 py-2 w-8">#</th>
                    <th className="px-4 py-2">Lección</th>
                    <th className="px-4 py-2 text-right">Iniciaron</th>
                    <th className="px-4 py-2 text-right">Completaron</th>
                    <th className="px-4 py-2 min-w-[140px]">% Completado</th>
                    <th className="px-4 py-2 text-right">Tiempo medio</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => {
                    const started = Number(r.started)
                    const completed = Number(r.completed)
                    const pct = started > 0 ? Math.round((completed / started) * 100) : 0
                    const isLow = pct < 50 && started > 0
                    return (
                      <tr
                        key={String(r.lesson_id)}
                        className={`border-b last:border-0 ${isLow ? 'bg-amber-50 dark:bg-amber-950/20' : ''}`}
                      >
                        <td className="px-4 py-3 text-muted-foreground">{r.position}</td>
                        <td className="px-4 py-3 font-medium">{r.title}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <div
                              className="h-1.5 rounded-full bg-primary/30"
                              style={{ width: `${Math.round((started / maxStarted) * 48)}px` }}
                            />
                            {started}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">{completed}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-1.5">
                              <div className="bg-primary h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs w-8 text-right">{pct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          {fmtTime(r.avg_seconds)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
