'use server'

import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function getSignedNotesUrl(lessonId: string): Promise<{ url?: string; error?: string }> {
  const user = await requireUser().catch(() => null)
  if (!user) return { error: 'No autenticado' }

  const db = createAdminClient()

  const { data: lesson } = await db
    .from('lessons')
    .select('notes_pdf_path, course_id')
    .eq('id', lessonId)
    .single()

  if (!lesson?.notes_pdf_path) return { error: 'Sin apuntes' }

  // Comprobar matrícula o admin
  const { data: profile } = await db.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') {
    const { data: enrollment } = await db
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', lesson.course_id)
      .eq('status', 'active')
      .maybeSingle()
    if (!enrollment) return { error: 'Sin acceso' }
  }

  const { data, error } = await db.storage
    .from('notes')
    .createSignedUrl(lesson.notes_pdf_path, 3600)

  if (error) return { error: error.message }
  return { url: data.signedUrl }
}
