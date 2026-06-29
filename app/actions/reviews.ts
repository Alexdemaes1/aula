'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const schema = z.object({
  course_id: z.string().uuid(),
  rating: z.coerce.number().int().min(1, 'Elige una puntuación').max(5),
  comment: z.string().max(1000).default(''),
})

type Result = { error?: string; success?: string } | null

/** Crea o actualiza la reseña del usuario (requiere matrícula activa). */
export async function upsertReviewAction(_prev: unknown, formData: FormData): Promise<Result> {
  const user = await requireUser()
  const parsed = schema.safeParse({
    course_id: formData.get('course_id'),
    rating: formData.get('rating'),
    comment: formData.get('comment'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const db = createAdminClient()

  // Verificación de compra: solo alumnos con matrícula activa pueden reseñar.
  const { data: enrollment } = await db
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', parsed.data.course_id)
    .eq('status', 'active')
    .maybeSingle()
  if (!enrollment) return { error: 'Solo puedes valorar cursos que hayas adquirido' }

  const { error } = await db.from('course_reviews').upsert(
    {
      course_id: parsed.data.course_id,
      user_id: user.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment.trim() || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'course_id,user_id' }
  )
  if (error) return { error: error.message }

  const { data: course } = await db.from('courses').select('slug').eq('id', parsed.data.course_id).single()
  if (course?.slug) revalidatePath(`/courses/${course.slug}`)
  return { success: '¡Gracias por tu valoración!' }
}

/** Elimina la reseña propia del usuario. */
export async function deleteMyReviewAction(courseId: string, slug: string): Promise<void> {
  const user = await requireUser()
  const db = createAdminClient()
  await db.from('course_reviews').delete().eq('course_id', courseId).eq('user_id', user.id)
  revalidatePath(`/courses/${slug}`)
}
