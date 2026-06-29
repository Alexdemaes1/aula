import { notFound, redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCourseBySlug, getLessonsByCourse, getLessonProgress, getUserRole } from '@/lib/data/learn'
import { YouTubePlayer } from '@/components/youtube-player'
import { TextLesson } from '@/components/text-lesson'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { FileDown, Lock, ChevronLeft, ChevronRight } from 'lucide-react'
import { getSignedNotesUrl } from '@/app/actions/notes'

interface PageProps {
  params: Promise<{ courseSlug: string; lessonId: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { lessonId } = await params
  const db = createAdminClient()
  const { data } = await db.from('lessons').select('title').eq('id', lessonId).single()
  return { title: data?.title ?? 'Lección' }
}

export default async function LessonPage({ params }: PageProps) {
  const [{ courseSlug, lessonId }, user] = await Promise.all([params, requireUser()])
  const db = createAdminClient()

  // React cache() deduplica: layout ya llamó a estas funciones en este mismo request
  const course = await getCourseBySlug(courseSlug)
  if (!course) notFound()

  const [role, allLessons, allProgress] = await Promise.all([
    getUserRole(user.id),
    getLessonsByCourse(course.id),
    getLessonProgress(user.id),
  ])
  const isAdmin = role === 'admin'

  if (!isAdmin) {
    const { data: enrollment } = await db
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', course.id)
      .eq('status', 'active')
      .maybeSingle()
    if (!enrollment) redirect(`/courses/${courseSlug}`)
  }

  const { data: lesson } = await db
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .eq('course_id', course.id)
    .single()

  if (!lesson) notFound()

  const progressMap = new Map(allProgress.map((p) => [p.lesson_id, p]))
  const lessonIndex = allLessons.findIndex((l) => l.id === lessonId)

  const isLocked =
    !isAdmin &&
    lessonIndex > 0 &&
    progressMap.get(allLessons[lessonIndex - 1].id)?.completed !== true

  const prevLesson = lessonIndex > 0 ? allLessons[lessonIndex - 1] : undefined
  const nextLesson = allLessons[lessonIndex + 1]
  const currentProgress = progressMap.get(lessonId)
  const canGoNext = !!nextLesson && (isAdmin || currentProgress?.completed === true)

  let notesUrl: string | null = null
  if (lesson.notes_pdf_path) {
    const result = await getSignedNotesUrl(lessonId)
    notesUrl = result.url ?? null
  }

  return (
    <>
      {isLocked ? (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <Lock className="size-12 text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-semibold mb-2">Lección bloqueada</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Completa la lección anterior para desbloquear esta.
          </p>
          {lessonIndex > 0 && (
            <a
              href={`/learn/${courseSlug}/${allLessons[lessonIndex - 1].id}`}
              className="text-sm text-primary underline hover:no-underline"
            >
              ← Ir a la lección anterior
            </a>
          )}
        </div>
      ) : (
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
          <div className="space-y-1">
            <Badge variant="outline" className="text-xs">
              Lección {lesson.position}
            </Badge>
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            {lesson.description && (
              <p className="text-muted-foreground whitespace-pre-wrap">{lesson.description}</p>
            )}
          </div>

          {lesson.content_type === 'text' ? (
            <TextLesson
              body={lesson.body ?? ''}
              lessonId={lessonId}
              minWatchSeconds={lesson.min_watch_seconds}
              initialWatched={currentProgress?.watched_seconds ?? 0}
              initialCompleted={currentProgress?.completed ?? false}
              courseSlug={courseSlug}
              nextLessonId={nextLesson?.id}
            />
          ) : (
            <YouTubePlayer
              videoId={lesson.youtube_video_id}
              lessonId={lessonId}
              minWatchSeconds={lesson.min_watch_seconds}
              initialWatched={currentProgress?.watched_seconds ?? 0}
              initialPosition={currentProgress?.last_position ?? 0}
              initialCompleted={currentProgress?.completed ?? false}
              courseSlug={courseSlug}
              nextLessonId={nextLesson?.id}
            />
          )}

          {notesUrl && (
            <>
              <Separator />
              <div className="flex items-center gap-3">
                <FileDown className="size-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Apuntes de la lección</p>
                  <p className="text-xs text-muted-foreground">PDF descargable</p>
                </div>
                <a
                  href={notesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'ml-auto')}
                >
                  Descargar PDF
                </a>
              </div>
            </>
          )}

          {/* Navegación entre lecciones */}
          <div className="flex items-center justify-between gap-3 pt-5 border-t">
            {prevLesson ? (
              <a
                href={`/learn/${courseSlug}/${prevLesson.id}`}
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
              >
                <ChevronLeft className="size-4 mr-1" /> Anterior
              </a>
            ) : (
              <span />
            )}
            {nextLesson ? (
              canGoNext ? (
                <a
                  href={`/learn/${courseSlug}/${nextLesson.id}`}
                  className={cn(buttonVariants({ size: 'sm' }))}
                >
                  Siguiente <ChevronRight className="size-4 ml-1" />
                </a>
              ) : (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="size-3" /> Completa esta lección para continuar
                </span>
              )
            ) : (
              <span />
            )}
          </div>
        </div>
      )}
    </>
  )
}
