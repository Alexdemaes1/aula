import { redirect, notFound } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

interface PageProps {
  params: Promise<{ courseSlug: string }>
}

export default async function LearnIndexPage({ params }: PageProps) {
  const { courseSlug } = await params
  const user = await requireUser()
  const db = createAdminClient()

  const { data: course } = await db
    .from('courses')
    .select('id')
    .eq('slug', courseSlug)
    .single()

  if (!course) notFound()

  // Buscar la primera lección no completada, o la primera si todas están completas
  const [{ data: lessons }, { data: progress }] = await Promise.all([
    db.from('lessons').select('id').eq('course_id', course.id).order('position'),
    db
      .from('lesson_progress')
      .select('lesson_id, completed')
      .eq('user_id', user.id)
      .eq('completed', true),
  ])

  if (!lessons?.length) notFound()

  const completedIds = new Set(progress?.map((p) => p.lesson_id) ?? [])
  const firstPending = lessons.find((l) => !completedIds.has(l.id)) ?? lessons[0]

  redirect(`/learn/${courseSlug}/${firstPending.id}`)
}
