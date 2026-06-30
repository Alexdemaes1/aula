'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin, requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

type Kind = 'audio' | 'video'

/**
 * Genera una URL de subida FIRMADA para que el navegador suba el archivo
 * directamente a Supabase Storage (los vídeos/audios son demasiado grandes
 * para pasar por una server action). Solo admin.
 */
export async function createMediaUploadUrl(
  courseId: string,
  lessonId: string,
  kind: Kind
): Promise<{ path?: string; token?: string; error?: string }> {
  await requireAdmin()
  const ext = kind === 'audio' ? 'mp3' : 'mp4'
  const path = `${courseId}/${lessonId}/${kind}.${ext}`
  const db = createAdminClient()
  const { data, error } = await db.storage.from('media').createSignedUploadUrl(path, { upsert: true })
  if (error) return { error: error.message }
  return { path: data.path, token: data.token }
}

/** Guarda la ruta del archivo subido en la lección. Solo admin. */
export async function setLessonMediaAction(
  lessonId: string,
  courseId: string,
  path: string,
  provider = 'supabase'
): Promise<{ error?: string }> {
  await requireAdmin()
  const db = createAdminClient()
  const { error } = await db
    .from('lessons')
    .update({ media_path: path, media_provider: provider })
    .eq('id', lessonId)
    .eq('course_id', courseId)
  if (error) return { error: error.message }
  revalidatePath(`/admin/courses/${courseId}`)
  return {}
}

/** Elimina el archivo de media de una lección (storage + columna). Solo admin. */
export async function removeLessonMediaAction(
  lessonId: string,
  courseId: string,
  path: string
): Promise<void> {
  await requireAdmin()
  const db = createAdminClient()
  if (path) await db.storage.from('media').remove([path])
  await db.from('lessons').update({ media_path: null }).eq('id', lessonId).eq('course_id', courseId)
  revalidatePath(`/admin/courses/${courseId}`)
}

/**
 * URL firmada para reproducir el media de una lección. Autoriza si: admin,
 * matrícula activa, o la lección es vista previa gratuita. TTL 2 h.
 */
export async function getSignedMediaUrl(lessonId: string): Promise<{ url?: string; error?: string }> {
  const db = createAdminClient()
  const { data: lesson } = await db
    .from('lessons')
    .select('media_path, course_id, is_preview')
    .eq('id', lessonId)
    .single()
  if (!lesson?.media_path) return { error: 'Sin archivo' }

  // Las lecciones de vista previa son accesibles sin sesión; el resto requieren
  // matrícula activa o admin.
  if (!lesson.is_preview) {
    const user = await requireUser().catch(() => null)
    if (!user) return { error: 'No autenticado' }
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
  }

  const { data, error } = await db.storage.from('media').createSignedUrl(lesson.media_path, 7200)
  if (error) return { error: error.message }
  return { url: data.signedUrl }
}
