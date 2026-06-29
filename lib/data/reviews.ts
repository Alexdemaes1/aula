import { createAdminClient } from '@/lib/supabase/admin'

export interface CourseReview {
  id: string
  rating: number
  comment: string | null
  created_at: string
  full_name: string
}

export interface ReviewsSummary {
  reviews: CourseReview[]
  average: number
  count: number
}

/** Reseñas de un curso + media y total. */
export async function getCourseReviews(courseId: string): Promise<ReviewsSummary> {
  const db = createAdminClient()
  const { data } = await db
    .from('course_reviews')
    .select('id, rating, comment, created_at, profiles(full_name)')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false })

  const reviews: CourseReview[] = (data ?? []).map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    created_at: r.created_at,
    full_name: (r.profiles as unknown as { full_name: string } | null)?.full_name || 'Alumno/a',
  }))

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
