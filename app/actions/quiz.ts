'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export interface QuizSubmitResult {
  ok: boolean
  error?: string
  scorePct?: number
  passed?: boolean
  // Por pregunta: opciones correctas y las elegidas por el alumno (para feedback)
  corrections?: Record<string, { correctOptionIds: string[]; chosenOptionIds: string[]; correct: boolean }>
  attemptsLeft?: number | null
}

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const setB = new Set(b)
  return a.every(x => setB.has(x))
}

/**
 * Califica un intento de cuestionario EN SERVIDOR (nunca se expone is_correct al
 * cliente). El cuestionario es autoevaluación opcional: NO toca lesson_progress
 * ni el desbloqueo del curso.
 */
export async function submitQuizAttempt(
  quizId: string,
  answers: Record<string, string[]>
): Promise<QuizSubmitResult> {
  const user = await requireUser()
  const db = createAdminClient()

  // Cuestionario + curso
  const { data: quiz } = await db
    .from('quizzes')
    .select('id, course_id, passing_score, max_attempts')
    .eq('id', quizId)
    .single()
  if (!quiz) return { ok: false, error: 'Cuestionario no encontrado' }

  // Matrícula activa (o admin) en el curso
  const { data: enrollment } = await db
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', quiz.course_id)
    .eq('status', 'active')
    .maybeSingle()

  let isAdmin = false
  if (!enrollment) {
    const { data: profile } = await db.from('profiles').select('role').eq('id', user.id).single()
    isAdmin = profile?.role === 'admin'
    if (!isAdmin) return { ok: false, error: 'No tienes acceso a este cuestionario' }
  }

  // Límite de intentos
  const { count: usedCount } = await db
    .from('quiz_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('quiz_id', quizId)
  if (quiz.max_attempts != null && (usedCount ?? 0) >= quiz.max_attempts) {
    return { ok: false, error: 'Has agotado los intentos de este cuestionario.' }
  }

  // Preguntas + opciones (con is_correct, solo en servidor)
  const { data: questions } = await db
    .from('quiz_questions')
    .select('id, type, quiz_options(id, is_correct)')
    .eq('quiz_id', quizId)

  const list = (questions ?? []) as {
    id: string
    type: string
    quiz_options: { id: string; is_correct: boolean }[]
  }[]

  if (list.length === 0) return { ok: false, error: 'El cuestionario no tiene preguntas.' }

  let correctCount = 0
  const corrections: NonNullable<QuizSubmitResult['corrections']> = {}

  for (const q of list) {
    const correctIds = q.quiz_options.filter(o => o.is_correct).map(o => o.id)
    const chosen = answers[q.id] ?? []
    // single/boolean: 1 correcta; multiple: conjunto exacto (acierto total).
    // correctIds.length>0 evita que una pregunta sin opción correcta (dato erróneo)
    // marque como acierto una respuesta vacía vía sameSet([], []).
    const isCorrect = correctIds.length > 0 && sameSet(correctIds, chosen)
    if (isCorrect) correctCount++
    corrections[q.id] = { correctOptionIds: correctIds, chosenOptionIds: chosen, correct: isCorrect }
  }

  const scorePct = Math.round((correctCount / list.length) * 100)
  const passed = scorePct >= quiz.passing_score

  await db.from('quiz_attempts').insert({
    quiz_id: quizId,
    user_id: user.id,
    score: scorePct,
    passed,
    answers,
  })

  revalidatePath(`/learn`, 'layout')

  const attemptsLeft = quiz.max_attempts == null ? null : Math.max(0, quiz.max_attempts - ((usedCount ?? 0) + 1))
  return { ok: true, scorePct, passed, corrections, attemptsLeft }
}
