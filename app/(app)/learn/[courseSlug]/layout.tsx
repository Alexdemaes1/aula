import { notFound, redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { LessonSidebar } from '@/components/lesson-sidebar'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ courseSlug: string }>
}

export default async function LearnLayout({ children, params }: LayoutProps) {
  const { courseSlug } = await params
  const user = await requireUser()
  const db = createAdminClient()

  const { data: course } = await db
    .from('courses')
    .select('id, title, slug')
    .eq('slug', courseSlug)
    .single()

  if (!course) notFound()

  // Verificar matrícula
  const { data: enrollment } = await db
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .eq('status', 'active')
    .maybeSingle()

  // Admin puede ver sin matrícula
  const { data: profile } = await db.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

  if (!enrollment && !isAdmin) {
    redirect(`/courses/${courseSlug}`)
  }

  // Lecciones con progreso
  const [{ data: lessons }, { data: progresses }] = await Promise.all([
    db.from('lessons').select('id, title, position').eq('course_id', course.id).order('position'),
    db
      .from('lesson_progress')
      .select('lesson_id, completed')
      .eq('user_id', user.id),
  ])

  const progressMap = new Map(progresses?.map((p) => [p.lesson_id, p.completed]) ?? [])

  const sidebarLessons = (lessons ?? []).map((lesson, idx) => {
    const prevCompleted = idx === 0 || progressMap.get((lessons ?? [])[idx - 1]?.id) === true
    return {
      id: lesson.id,
      title: lesson.title,
      position: lesson.position,
      completed: progressMap.get(lesson.id) ?? false,
      unlocked: isAdmin || idx === 0 || prevCompleted,
    }
  })

  return (
    <div className="flex h-screen overflow-hidden">
      <LessonSidebar
        courseSlug={courseSlug}
        courseTitle={course.title}
        lessons={sidebarLessons}
      />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
