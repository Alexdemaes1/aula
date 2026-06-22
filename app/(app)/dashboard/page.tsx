import Link from 'next/link'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { BookOpen, ArrowRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils/format'

export const metadata = { title: 'Mis cursos' }

export default async function DashboardPage() {
  const user = await requireUser()
  const db = createAdminClient()

  const { data: enrollments } = await db
    .from('enrollments')
    .select('*, courses(*)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('purchased_at', { ascending: false })

  const courseIds = enrollments?.map((e) => (e.courses as any)?.id).filter(Boolean) ?? []

  // Progreso de cada curso
  const progressData = await Promise.all(
    courseIds.map(async (courseId) => {
      const { data: lessons } = await db
        .from('lessons')
        .select('id')
        .eq('course_id', courseId)

      const { data: completed } = await db
        .from('lesson_progress')
        .select('id')
        .eq('user_id', user.id)
        .in('lesson_id', lessons?.map((l) => l.id) ?? [])
        .eq('completed', true)

      return {
        courseId,
        total: lessons?.length ?? 0,
        done: completed?.length ?? 0,
      }
    })
  )

  const progressMap = new Map(progressData.map((p) => [p.courseId, p]))

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Mis cursos</h1>
        <p className="text-muted-foreground">
          {enrollments?.length
            ? `${enrollments.length} ${enrollments.length === 1 ? 'curso adquirido' : 'cursos adquiridos'}`
            : 'Todavía no tienes ningún curso'}
        </p>
      </div>

      {!enrollments?.length ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border rounded-xl border-dashed">
          <BookOpen className="size-12 text-muted-foreground/30 mb-4" />
          <h2 className="font-semibold mb-2">Tu biblioteca está vacía</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Explora el catálogo y adquiere tu primer curso
          </p>
          <Link href="/" className={buttonVariants()}>Ver catálogo</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((e) => {
            const course = e.courses as any
            if (!course) return null
            const prog = progressMap.get(course.id)
            const percent = prog && prog.total > 0
              ? Math.round((prog.done / prog.total) * 100)
              : 0

            return (
              <Card key={e.id} className="overflow-hidden">
                {course.cover_url ? (
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    <img src={course.cover_url} alt={course.title} className="object-cover w-full h-full" />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <BookOpen className="size-10 text-primary/20" />
                  </div>
                )}
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold line-clamp-1">{course.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {percent === 100 ? (
                        <Badge className="text-xs">Completado</Badge>
                      ) : percent > 0 ? (
                        <Badge variant="outline" className="text-xs">En progreso</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Sin empezar</Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{prog?.done ?? 0}/{prog?.total ?? course.lesson_count} lecciones</span>
                      <span>{percent}%</span>
                    </div>
                    <Progress value={percent} className="h-1.5" />
                  </div>

                  <Link href={`/learn/${course.slug}`} className={cn(buttonVariants({ size: 'sm' }), 'w-full')}>
                    {percent === 0 ? 'Empezar' : percent === 100 ? 'Repasar' : 'Continuar'}
                    <ArrowRight className="size-4 ml-1.5" />
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
