import { createAdminClient } from '@/lib/supabase/admin'
import type { Course } from '@/types'

/** ¿El usuario tiene este curso en favoritos? */
export async function isFavorite(userId: string, courseId: string): Promise<boolean> {
  const db = createAdminClient()
  const { data } = await db
    .from('course_favorites')
    .select('course_id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle()
  return !!data
}

/** Cursos favoritos del usuario (publicados), más recientes primero. */
export async function getFavoriteCourses(userId: string): Promise<Course[]> {
  const db = createAdminClient()
  const { data } = await db
    .from('course_favorites')
    .select('created_at, courses(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return (data ?? [])
    .map((row) => row.courses as unknown as Course | null)
    .filter((c): c is Course => !!c && c.is_published)
}
