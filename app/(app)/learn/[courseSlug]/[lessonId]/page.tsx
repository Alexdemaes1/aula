import { notFound, redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { YouTubePlayer } from '@/components/youtube-player'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { FileDown, Lock } from 'lucide-react'
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
  const { courseSlug, lessonId } = await params
  const user = await requireUser()
  const db = createAdminClient()

  // Cargar curso
  const { data: course } = await db
    .from('courses')
    .select('id, title, slug')
    .eq('slug', courseSlug)
    .single()
  if (!course) notFound()

  // Comprobar rol admin
  const { data: profile } = await db.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

  // Comprobar matrícula (si no es admin)
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

  // Cargar lección y lecciones del curso para la lógica de desbloqueo
  const [{ data: lesson }, { data: allLessons }, { data: progress }] = await Promise.all([
    db.from('lessons').select('*').eq('id', lessonId).eq('course_id', course.id).single(),
    db.from('lessons').select('id, position').eq('course_id', course.id).order('position'),
    db
      .from('lesson_progress')
      .select('lesson_id, watched_seconds, completed')
      .eq('user_id', user.id),
  ])

  if (!lesson) notFound()

  const progressMap = new Map(progress?.map((p) => [p.lesson_id, p]) ?? [])

  // Comprobar si la lección está desbloqueada
  if (!isAdmin) {
    const sortedLessons = allLessons ?? []
    const lessonIndex = sortedLessons.findIndex((l) => l.id === lessonId)
    if (lessonIndex > 0) {
      const prevLesson = sortedLessons[lessonIndex - 1]
      const prevCompleted = progressMap.get(prevLesson.id)?.completed === true
      if (!prevCompleted) {
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Lock className="size-12 text-muted-foreground/30 mb-4" />
            <h2 className="text-lg font-semibold mb-2">Lección bloqueada</h2>
            <p className="text-muted-foreground text-sm">
              Completa la lección anterior para desbloquear esta.
            </p>
          </div>
        )
      }
    }
  }

  const currentProgress = progressMap.get(lessonId)
  const currentIndex = (allLessons ?? []).findIndex((l) => l.id === lessonId)
  const nextLesson = (allLessons ?? [])[currentIndex + 1]

  // Signed URL para apuntes (si tiene)
  let notesUrl: string | null = null
  if (lesson.notes_pdf_path) {
    const result = await getSignedNotesUrl(lessonId)
    notesUrl = result.url ?? null
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">Lección {lesson.position}</Badge>
        </div>
        <h1 className="text-2xl font-bold">{lesson.title}</h1>
        {lesson.description && (
          <p className="text-muted-foreground">{lesson.description}</p>
        )}
      </div>

      <YouTubePlayer
        videoId={lesson.youtube_video_id}
        lessonId={lessonId}
        minWatchSeconds={lesson.min_watch_seconds}
        initialWatched={currentProgress?.watched_seconds ?? 0}
        initialCompleted={currentProgress?.completed ?? false}
        courseSlug={courseSlug}
        nextLessonId={nextLesson?.id}
      />

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
    </div>
  )
}
