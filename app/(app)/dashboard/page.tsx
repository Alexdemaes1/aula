import Link from 'next/link'
import { CourseCover } from '@/components/course-cover'
import { CourseCard } from '@/components/course-card'
import { getFavoriteCourses } from '@/lib/data/favorites'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { BookOpen, ArrowRight, Trophy, Clock, CheckCircle, GraduationCap, Award } from 'lucide-react'
import { isCourseCompleted, courseProgressPercent, type CourseQuizGate } from '@/lib/completion'

export const metadata = { title: 'Mis cursos' }

export default async function DashboardPage() {
  const user = await requireUser()
  const db = createAdminClient()

  const [{ data: enrollments }, { data: profile }] = await Promise.all([
    db
      .from('enrollments')
      .select('*, courses(*)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('purchased_at', { ascending: false }),
    db.from('profiles').select('full_name').eq('id', user.id).single(),
  ])

  const firstName = profile?.full_name?.split(' ')[0] ?? null
  const courseIds = enrollments?.map((e) => (e.courses as any)?.id).filter(Boolean) ?? []

  const favorites = await getFavoriteCourses(user.id)
  const savedCourses = favorites.filter((c) => !courseIds.includes(c.id))

  let progressMap = new Map<string, { total: number; done: number }>()
  let totalWatchedSeconds = 0
  let totalLessonsCompleted = 0
  // course_id -> quizId del quiz obligatorio (si lo hay) + set de quizzes aprobados
  const requiredQuizByCourse = new Map<string, string>()
  let passedQuizIds = new Set<string>()

  if (courseIds.length > 0) {
    // Batch query: todas las lecciones de todos los cursos matriculados
    const { data: allLessons } = await db
      .from('lessons')
      .select('id, course_id')
      .in('course_id', courseIds)

    const allLessonIds = allLessons?.map((l) => l.id) ?? []

    // Batch query: todo el progreso de esas lecciones
    const { data: allProgress } = allLessonIds.length > 0
      ? await db
          .from('lesson_progress')
          .select('lesson_id, watched_seconds, completed')
          .eq('user_id', user.id)
          .in('lesson_id', allLessonIds)
      : { data: [] }

    const progressByLesson = new Map(
      (allProgress ?? []).map((p) => [p.lesson_id, p])
    )

    totalWatchedSeconds =
      (allProgress ?? []).reduce((acc, p) => acc + (p.watched_seconds ?? 0), 0)
    totalLessonsCompleted =
      (allProgress ?? []).filter((p) => p.completed).length

    // Agrupar lecciones por curso
    const lessonsByCourse = new Map<string, string[]>()
    for (const lesson of allLessons ?? []) {
      const existing = lessonsByCourse.get(lesson.course_id) ?? []
      existing.push(lesson.id)
      lessonsByCourse.set(lesson.course_id, existing)
    }

    for (const courseId of courseIds) {
      const lessonIds = lessonsByCourse.get(courseId) ?? []
      const total = lessonIds.length
      const done = lessonIds.filter((id) => progressByLesson.get(id)?.completed).length
      progressMap.set(courseId, { total, done })
    }

    // Quizzes obligatorios de los cursos matriculados + intentos aprobados del usuario
    const { data: reqQuizzes } = await db
      .from('quizzes')
      .select('id, course_id')
      .in('course_id', courseIds)
      .eq('required_for_completion', true)
    for (const q of reqQuizzes ?? []) requiredQuizByCourse.set(q.course_id, q.id)

    const reqQuizIds = (reqQuizzes ?? []).map((q) => q.id)
    if (reqQuizIds.length > 0) {
      const { data: passedAtt } = await db
        .from('quiz_attempts')
        .select('quiz_id')
        .eq('user_id', user.id)
        .eq('passed', true)
        .in('quiz_id', reqQuizIds)
      passedQuizIds = new Set((passedAtt ?? []).map((a) => a.quiz_id))
    }
  }

  function gateFor(courseId: string): CourseQuizGate {
    const qid = requiredQuizByCourse.get(courseId)
    return { hasRequiredQuiz: !!qid, quizPassed: !!qid && passedQuizIds.has(qid) }
  }

  const coursesCompleted = courseIds.filter((id) => {
    const prog = progressMap.get(id)
    return prog ? isCourseCompleted(prog.total, prog.done, gateFor(id)) : false
  }).length

  const hoursLearned = Math.floor(totalWatchedSeconds / 3600)
  const minutesLearned = Math.floor((totalWatchedSeconds % 3600) / 60)
  const timeLabel =
    hoursLearned > 0
      ? `${hoursLearned}h ${minutesLearned}m`
      : `${minutesLearned}m`

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          {firstName ? `Hola, ${firstName}` : 'Mis cursos'}
        </h1>
        <p className="text-muted-foreground mt-0.5">
          {enrollments?.length
            ? `Tienes ${enrollments.length} ${enrollments.length === 1 ? 'curso adquirido' : 'cursos adquiridos'}`
            : 'Todavía no tienes ningún curso'}
        </p>
      </div>

      {/* Estadísticas (solo si hay cursos) */}
      {enrollments && enrollments.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: GraduationCap, label: 'Cursos adquiridos', value: enrollments.length },
            { icon: Trophy, label: 'Cursos completados', value: coursesCompleted },
            { icon: CheckCircle, label: 'Lecciones vistas', value: totalLessonsCompleted },
            { icon: Clock, label: 'Tiempo aprendiendo', value: timeLabel },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl border bg-card p-4 flex items-start gap-3">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!enrollments?.length ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border rounded-xl border-dashed">
          <BookOpen className="size-12 text-muted-foreground/30 mb-4" />
          <h2 className="font-semibold mb-2">Tu biblioteca está vacía</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Explora el catálogo y adquiere tu primer curso
          </p>
          <Link href="/cursos" className={buttonVariants()}>
            Ver cursos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((e) => {
            const course = e.courses as any
            if (!course) return null
            const prog = progressMap.get(course.id)
            const percent = prog ? courseProgressPercent(prog.total, prog.done, gateFor(course.id)) : 0

            return (
              <Card key={e.id} className="overflow-hidden">
                <CourseCover
                  coverUrl={course.cover_url}
                  character={course.cover_character}
                  palette={course.cover_palette}
                  title={course.title}
                  className="aspect-video"
                  charClassName="text-5xl"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold line-clamp-1">{course.title}</h3>
                    <div className="mt-1">
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
                      <span>
                        {prog?.done ?? 0}/{prog?.total ?? course.lesson_count} lecciones
                      </span>
                      <span>{percent}%</span>
                    </div>
                    <Progress value={percent} className="h-1.5" />
                  </div>

                  <Link
                    href={`/learn/${course.slug}`}
                    className={cn(buttonVariants({ size: 'sm' }), 'w-full')}
                  >
                    {percent === 0 ? 'Empezar' : percent === 100 ? 'Repasar' : 'Continuar'}
                    <ArrowRight className="size-4 ml-1.5" />
                  </Link>

                  {percent === 100 && (
                    <a
                      href={`/learn/${course.slug}/certificate`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'w-full')}
                    >
                      <Award className="size-4 mr-1.5" />
                      Descargar certificado
                    </a>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {savedCourses.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-heading text-2xl font-semibold">Guardados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedCourses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
