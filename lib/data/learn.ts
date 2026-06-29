import { cache } from 'react'
import { createAdminClient } from '@/lib/supabase/admin'

// React cache() deduplica entre layout y page en el mismo request
export const getLessonsByCourse = cache(async (courseId: string) => {
  const db = createAdminClient()
  const { data } = await db
    .from('lessons')
    .select('id, title, position, content_type')
    .eq('course_id', courseId)
    .order('position')
  return data ?? []
})

// Cuestionarios de autoevaluación del curso (opcionales, fuera de la secuencia)
export const getCourseQuizzes = cache(async (courseId: string) => {
  const db = createAdminClient()
  const { data } = await db
    .from('quizzes')
    .select('id, title, position, required_for_completion')
    .eq('course_id', courseId)
    .order('position')
  return data ?? []
})

// IDs de cuestionarios que el usuario ha aprobado (de un conjunto dado)
export const getPassedQuizIds = cache(async (userId: string, quizIds: string[]) => {
  if (quizIds.length === 0) return new Set<string>()
  const db = createAdminClient()
  const { data } = await db
    .from('quiz_attempts')
    .select('quiz_id')
    .eq('user_id', userId)
    .eq('passed', true)
    .in('quiz_id', quizIds)
  return new Set((data ?? []).map((a) => a.quiz_id))
})

export const getLessonProgress = cache(async (userId: string) => {
  const db = createAdminClient()
  const { data } = await db
    .from('lesson_progress')
    .select('lesson_id, watched_seconds, last_position, completed')
    .eq('user_id', userId)
  return data ?? []
})

export const getCourseBySlug = cache(async (slug: string) => {
  const db = createAdminClient()
  const { data } = await db
    .from('courses')
    .select('id, title, slug')
    .eq('slug', slug)
    .single()
  return data ?? null
})

export const getUserRole = cache(async (userId: string) => {
  const db = createAdminClient()
  const { data } = await db
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  return (data?.role ?? 'user') as string
})
