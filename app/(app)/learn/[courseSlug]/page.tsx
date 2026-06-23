import { redirect, notFound } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { getCourseBySlug, getLessonsByCourse, getLessonProgress } from '@/lib/data/learn'

interface PageProps {
  params: Promise<{ courseSlug: string }>
}

export default async function LearnIndexPage({ params }: PageProps) {
  const [{ courseSlug }, user] = await Promise.all([params, requireUser()])

  const course = await getCourseBySlug(courseSlug)
  if (!course) notFound()

  const [lessons, allProgress] = await Promise.all([
    getLessonsByCourse(course.id),
    getLessonProgress(user.id),
  ])

  if (!lessons.length) notFound()

  const completedIds = new Set(allProgress.filter((p) => p.completed).map((p) => p.lesson_id))
  const firstPending = lessons.find((l) => !completedIds.has(l.id)) ?? lessons[0]

  redirect(`/learn/${courseSlug}/${firstPending.id}`)
}
