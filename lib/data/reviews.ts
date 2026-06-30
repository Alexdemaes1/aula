import { createAdminClient } from '@/lib/supabase/admin'

export interface CourseReview {
  id: string
  rating: number
  comment: string | null
  created_at: string
  full_name: string
  avatar_url: string | null
}

export interface ReviewsSummary {
  reviews: CourseReview[]
  average: number
  count: number
}

/** Reseñas de un curso + media y total. */
export async function getCourseReviews(courseId: string): Promise<ReviewsSummary> {
  const db = createAdminClient()
  // Defensivo: si avatar_url aún no existe (migración 015 sin aplicar), reintenta sin ella.
  const primary = await db
    .from('course_reviews')
    .select('id, rating, comment, created_at, profiles(full_name, avatar_url)')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false })
  let rows: Array<Record<string, unknown>> | null = primary.data as Array<Record<string, unknown>> | null
  if (primary.error) {
    const fb = await db
      .from('course_reviews')
      .select('id, rating, comment, created_at, profiles(full_name)')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false })
    rows = fb.data as Array<Record<string, unknown>> | null
  }

  const reviews: CourseReview[] = (rows ?? []).map((r) => {
    const p = r.profiles as { full_name?: string; avatar_url?: string | null } | null
    return {
      id: r.id as string,
      rating: r.rating as number,
      comment: (r.comment as string | null) ?? null,
      created_at: r.created_at as string,
      full_name: p?.full_name || 'Alumno/a',
      avatar_url: p?.avatar_url ?? null,
    }
  })

  const count = reviews.length
  const average = count > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0
  return { reviews, average, count }
}

/** Reseña del usuario para un curso (si existe). */
export async function getMyReview(courseId: string, userId: string) {
  const db = createAdminClient()
  const { data } = await db
    .from('course_reviews')
    .select('id, rating, comment')
    .eq('course_id', courseId)
    .eq('user_id', userId)
    .maybeSingle()
  return data
}
