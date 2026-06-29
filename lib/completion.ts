import { createAdminClient } from '@/lib/supabase/admin'
import { notify } from '@/lib/notify'
import { sendEmail, completionEmail } from '@/lib/email'

// ── Cálculo puro de completación (fuente de verdad única para la UI) ──────

export interface CourseQuizGate {
  hasRequiredQuiz: boolean // existe un quiz con required_for_completion=true
  quizPassed: boolean // el usuario tiene algún quiz_attempts.passed=true en ese quiz
}

/** ¿Curso completado? Todas las lecciones + (si aplica) el quiz obligatorio aprobado. */
export function isCourseCompleted(total: number, done: number, gate: CourseQuizGate): boolean {
  // Curso vacío (sin lecciones ni quiz obligatorio) nunca cuenta como completado.
  if (total === 0 && !gate.hasRequiredQuiz) return false
  return done === total && (!gate.hasRequiredQuiz || gate.quizPassed)
}

/**
 * Porcentaje mostrado. El quiz obligatorio cuenta como UN paso más en el
 * denominador (enfoque Teachable/Moodle: no llega al 100% hasta aprobarlo).
 */
export function courseProgressPercent(total: number, done: number, gate: CourseQuizGate): number {
  const denom = total + (gate.hasRequiredQuiz ? 1 : 0)
  if (denom === 0) return 0
  const numer = done + (gate.hasRequiredQuiz && gate.quizPassed ? 1 : 0)
  return Math.round((numer / denom) * 100)
}

/** Formatea segundos a "Xh Ym" / "Ym". */
export function formatSpent(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

// ── Registro de completación (escritura, server-only, best-effort) ────────

/**
 * Comprueba si un usuario ha completado un curso y, en tal caso, registra
 * (una sola vez) la completación en course_completions. Idempotente: si ya
 * existía, NO toca la fecha (ignoreDuplicates). Nunca lanza.
 */
export async function recordCompletionIfDone(userId: string, courseId: string): Promise<boolean> {
  const db = createAdminClient()
  try {
    // Defensa en profundidad: solo registramos completación de alumnos matriculados.
    const { data: enrollment } = await db
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('status', 'active')
      .maybeSingle()
    if (!enrollment) return false

    const [{ data: lessons }, { data: quizzes }] = await Promise.all([
      db.from('lessons').select('id, min_watch_seconds').eq('course_id', courseId),
      db.from('quizzes').select('id, required_for_completion').eq('course_id', courseId),
    ])

    const lessonList = lessons ?? []
    const requiredQuizzes = (quizzes ?? []).filter((q) => q.required_for_completion)
    // Curso vacío (sin lecciones ni quiz obligatorio): no hay nada que completar.
    if (lessonList.length === 0 && requiredQuizzes.length === 0) return false

    const lessonIds = lessonList.map((l) => l.id)
    const { data: progress } = lessonIds.length
      ? await db
          .from('lesson_progress')
          .select('lesson_id, watched_seconds, completed')
          .eq('user_id', userId)
          .in('lesson_id', lessonIds)
      : { data: [] as { lesson_id: string; watched_seconds: number; completed: boolean }[] }

    // Todas las lecciones completadas (true si no hay lecciones)
    const completedSet = new Set((progress ?? []).filter((p) => p.completed).map((p) => p.lesson_id))
    const allLessonsDone = lessonIds.every((id) => completedSet.has(id))
    if (!allLessonsDone) return false

    // Quizzes obligatorios aprobados
    if (requiredQuizzes.length > 0) {
      const { data: passed } = await db
        .from('quiz_attempts')
        .select('quiz_id')
        .eq('user_id', userId)
        .eq('passed', true)
        .in('quiz_id', requiredQuizzes.map((q) => q.id))
      const passedSet = new Set((passed ?? []).map((a) => a.quiz_id))
      if (!requiredQuizzes.every((q) => passedSet.has(q.id))) return false
    }

    // Tiempo dedicado (snapshot). Si el real es menor que el estimado, usar el estimado.
    const realSeconds = (progress ?? []).reduce((acc, p) => acc + (p.watched_seconds ?? 0), 0)
    const estimatedSeconds = lessonList.reduce((acc, l) => acc + (l.min_watch_seconds ?? 0), 0)
    const secondsSpent = Math.max(realSeconds, estimatedSeconds)

    const { data: inserted, error } = await db
      .from('course_completions')
      .upsert(
        { user_id: userId, course_id: courseId, seconds_spent: secondsSpent },
        { onConflict: 'user_id,course_id', ignoreDuplicates: true }
      )
      .select('user_id')
    if (error) {
      console.error('[completion]', error)
      notify('🚨 Error BD — completion', error.message, { priority: 4, tags: ['rotating_light'] })
      return false
    }

    // Solo en la PRIMERA vez que se registra: email de felicitación (best-effort).
    if (inserted && inserted.length > 0) {
      try {
        const [{ data: u }, { data: c }] = await Promise.all([
          db.auth.admin.getUserById(userId),
          db.from('courses').select('title, slug').eq('id', courseId).single(),
        ])
        if (u?.user?.email && c?.slug) {
          const e = completionEmail(c.title ?? 'tu curso', c.slug)
          await sendEmail(u.user.email, e.subject, e.html)
        }
      } catch {
        // best-effort
      }
    }
    return true
  } catch (e) {
    console.error('[completion]', e)
    return false
  }
}
