import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatDate } from '@/lib/utils/format'
import { formatSpent } from '@/lib/completion'

export const metadata = { title: 'Progreso del alumno — Admin' }

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const db = createAdminClient()

  const [{ data: profile }, { data: authUser }] = await Promise.all([
    db.from('profiles').select('full_name, role, created_at').eq('id', id).single(),
    db.auth.admin.getUserById(id),
  ])
  if (!profile) notFound()
  const email = authUser?.user?.email ?? '—'

  const { data: enrollments } = await db
    .from('enrollments')
    .select('id, status, purchased_at, courses(id, title, slug, lesson_count)')
    .eq('user_id', id)
    .order('purchased_at', { ascending: false })

  const courseIds = (enrollments ?? [])
    .map((e) => (e.courses as unknown as { id: string } | null)?.id)
    .filter(Boolean) as string[]

  const progressByCourse = new Map<string, { total: number; done: number }>()
  const completions = new Map<string, { completed_at: string; seconds_spent: number }>()

  if (courseIds.length) {
    const [{ data: lessons }, { data: comps }] = await Promise.all([
      db.from('lessons').select('id, course_id').in('course_id', courseIds),
      db.from('course_completions').select('course_id, completed_at, seconds_spent').eq('user_id', id).in('course_id', courseIds),
    ])
    const lessonIds = (lessons ?? []).map((l) => l.id)
    const { data: prog } = lessonIds.length
      ? await db.from('lesson_progress').select('lesson_id, completed').eq('user_id', id).in('lesson_id', lessonIds)
      : { data: [] as { lesson_id: string; completed: boolean }[] }
    const doneSet = new Set((prog ?? []).filter((p) => p.completed).map((p) => p.lesson_id))
    const byCourse = new Map<string, string[]>()
    for (const l of lessons ?? []) {
      const arr = byCourse.get(l.course_id) ?? []
      arr.push(l.id)
      byCourse.set(l.course_id, arr)
    }
    for (const cid of courseIds) {
      const ids = byCourse.get(cid) ?? []
      progressByCourse.set(cid, { total: ids.length, done: ids.filter((x) => doneSet.has(x)).length })
    }
    for (const c of comps ?? []) completions.set(c.course_id, { completed_at: c.completed_at, seconds_spent: c.seconds_spent })
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Breadcrumbs items={[{ label: 'Usuarios', href: '/admin/users' }, { label: profile.full_name || 'Alumno' }]} />
        <p className="kicker mb-1.5">Alumno</p>
        <h1 className="font-heading text-3xl font-semibold">{profile.full_name || 'Sin nombre'}</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          {email} · {profile.role} · registrado {formatDate(profile.created_at)}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cursos y progreso</CardTitle>
        </CardHeader>
        <CardContent>
          {!enrollments?.length ? (
            <p className="text-sm text-muted-foreground">Este alumno no tiene cursos.</p>
          ) : (
            <ul className="space-y-4">
              {enrollments.map((e) => {
                const course = e.courses as unknown as { id: string; title: string; slug: string; lesson_count: number } | null
                if (!course) return null
                const p = progressByCourse.get(course.id) ?? { total: course.lesson_count ?? 0, done: 0 }
                const percent = p.total > 0 ? Math.round((p.done / p.total) * 100) : 0
                const comp = completions.get(course.id)
                return (
                  <li key={e.id} className="border-b border-border/60 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <Link href={`/courses/${course.slug}`} className="text-sm font-medium hover:underline">
                        {course.title}
                      </Link>
                      {comp ? <Badge className="text-xs">Completado</Badge> : <span className="text-xs text-muted-foreground">{percent}%</span>}
                    </div>
                    <Progress value={percent} className="h-1.5" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1.5 flex-wrap gap-1">
                      <span>{p.done}/{p.total} lecciones · matrícula {e.status === 'active' ? 'activa' : 'reembolsada'}</span>
                      {comp && <span>Completado {formatDate(comp.completed_at)} · {formatSpent(comp.seconds_spent)}</span>}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
