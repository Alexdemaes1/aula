'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

/** Alterna un curso en la wishlist del usuario. Devuelve el nuevo estado. */
export async function toggleFavoriteAction(courseId: string): Promise<{ favorited: boolean; error?: string }> {
  const user = await requireUser()
  const db = createAdminClient()

  const { data: existing } = await db
    .from('course_favorites')
    .select('course_id')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .maybeSingle()

  if (existing) {
    await db.from('course_favorites').delete().eq('user_id', user.id).eq('course_id', courseId)
    revalidatePath('/dashboard')
    return { favorited: false }
  }

  const { error } = await db.from('course_favorites').insert({ user_id: user.id, course_id: courseId })
  if (error) return { favorited: false, error: error.message }
  revalidatePath('/dashboard')
  return { favorited: true }
}
