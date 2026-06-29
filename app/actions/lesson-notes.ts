'use server'

import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

/** Guarda (upsert) la nota personal del alumno para una lección. */
export async function saveLessonNoteAction(
  lessonId: string,
  content: string
): Promise<{ error?: string }> {
  const user = await requireUser()
  if (typeof lessonId !== 'string' || lessonId.length < 10) return { error: 'Lección inválida' }

  const db = createAdminClient()
  const { error } = await db.from('lesson_notes').upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      content: (content ?? '').slice(0, 5000),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,lesson_id' }
  )
  if (error) return { error: error.message }
  return {}
}
