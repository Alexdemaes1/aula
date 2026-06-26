import { notFound, redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCourseBySlug, getUserRole } from '@/lib/data/learn'
import { QuizRunner } from '@/components/quiz-runner'

interface PageProps {
  params: Promise<{ courseSlug: string; quizId: string }>
}

export const metadata = { robots: { index: false, follow: false } }

export default async function QuizPage({ params }: PageProps) {
  const [{ courseSlug, quizId }, user] = await Promise.all([params, requireUser()])
  const db = createAdminClient()

  const course = await getCourseBySlug(courseSlug)
  if (!course) notFound()

  const role = await getUserRole(user.id)
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

  const { data: quiz } = await db
    .from('quizzes')
    .select('id, course_id, title, passing_score, max_attempts')
    .eq('id', quizId)
    .single()
  if (!quiz || quiz.course_id !== course.id) notFound()

  // Opciones SIN is_correct: la respuesta correcta nunca viaja al cliente.
  const { data: questionsRaw } = await db
    .from('quiz_questions')
    .select('id, prompt, type, explanation, position, options:quiz_options(id, label, position)')
    .eq('quiz_id', quizId)
    .order('position')

  const questions = (questionsRaw ?? []).map((q) => ({
    id: q.id as string,
    prompt: q.prompt as string,
    type: q.type as 'single' | 'multiple' | 'boolean',
    explanation: (q.explanation as string) ?? '',
    options: ((q.options ?? []) as { id: string; label: string; position: number }[])
      .sort((a, b) => a.position - b.position)
      .map((o) => ({ id: o.id, label: o.label })),
  }))

  const { count: attemptsUsed } = await db
    .from('quiz_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('quiz_id', quizId)

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 text-center text-muted-foreground text-sm">
        Este cuestionario aún no tiene preguntas.
      </div>
    )
  }

  return (
    <QuizRunner
      quizId={quiz.id}
      title={quiz.title}
      passingScore={quiz.passing_score}
      maxAttempts={quiz.max_attempts}
      attemptsUsed={attemptsUsed ?? 0}
      questions={questions}
      courseSlug={courseSlug}
    />
  )
}
