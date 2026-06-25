import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCourseBySlug, getLessonsByCourse, getLessonProgress, getUserRole, getCourseQuizzes, getPassedQuizIds } from '@/lib/data/learn'
import { LessonSidebar } from '@/components/lesson-sidebar'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ courseSlug: string }>
}

export default async function LearnLayout({ children, params }: LayoutProps) {
  const { courseSlug } = await params
  const user = await requireUser()
  const db = createAdminClient()

  const course = await getCourseBySlug(courseSlug)
  if (!course) notFound()

  const [enrollment, role, lessons, allProgress, quizzes] = await Promise.all([
    db
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', course.id)
      .eq('status', 'active')
      .maybeSingle()
      .then((r) => r.data),
    getUserRole(user.id),
    getLessonsByCourse(course.id),
    getLessonProgress(user.id),
    getCourseQuizzes(course.id),
  ])
  const isAdmin = role === 'admin'

  if (!enrollment && !isAdmin) {
    redirect(`/courses/${courseSlug}`)
  }

  const progressMap = new Map(allProgress.map((p) => [p.lesson_id, p.completed]))

  const sidebarLessons = lessons.map((lesson, idx) => {
    const prevCompleted = idx === 0 || progressMap.get(lessons[idx - 1]?.id) === true
    return {
      id: lesson.id,
      title: lesson.title,
      position: lesson.position,
      contentType: (lesson.content_type ?? 'video') as 'video' | 'text',
      completed: progressMap.get(lesson.id) ?? false,
      unlocked: isAdmin || idx === 0 || prevCompleted,
    }
  })

  const passedSet = await getPassedQuizIds(user.id, quizzes.map((q) => q.id))
  const sidebarQuizzes = quizzes.map((q) => ({
    id: q.id,
    title: q.title,
    required: q.required_for_completion,
    passed: passedSet.has(q.id),
  }))

  return (
    <>
      <link rel="preconnect" href="https://www.youtube.com" />
      <link rel="preconnect" href="https://www.youtube-nocookie.com" />
      <link rel="dns-prefetch" href="https://i.ytimg.com" />
      <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
        <LessonSidebar
          courseSlug={courseSlug}
          courseTitle={course.title}
          lessons={sidebarLessons}
          quizzes={sidebarQuizzes}
        />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  )
}
