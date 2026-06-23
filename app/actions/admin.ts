'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { slugify } from '@/lib/utils/format'

// ── Cursos ────────────────────────────────────────────────

const courseSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  description: z.string().default(''),
  price_cents: z.coerce.number().int().min(0),
  currency: z.string().default('eur'),
  is_published: z.coerce.boolean().default(false),
  cover_url: z.string().url('URL de imagen inválida').optional().or(z.literal('')).transform(v => v || null),
})

export async function createCourseAction(_prev: unknown, formData: FormData) {
  await requireAdmin()
  const db = createAdminClient()

  const title = String(formData.get('title') ?? '')
  const raw = {
    title,
    slug: String(formData.get('slug') || slugify(title)),
    description: String(formData.get('description') ?? ''),
    price_cents: Number(formData.get('price_cents') ?? 0),
    currency: String(formData.get('currency') ?? 'eur'),
    is_published: formData.get('is_published') === 'true',
    cover_url: String(formData.get('cover_url') ?? ''),
  }

  const parsed = courseSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { data, error } = await db.from('courses').insert(parsed.data).select('id').single()
  if (error) {
    if (error.message.includes('unique')) return { error: 'Ya existe un curso con ese slug' }
    return { error: error.message }
  }

  revalidatePath('/admin/courses')
  revalidatePath('/')
  revalidatePath('/cursos')

  redirect(`/admin/courses/${data.id}`)
}

export async function updateCourseAction(_prev: unknown, formData: FormData) {
  await requireAdmin()
  const db = createAdminClient()

  const id = String(formData.get('id'))
  const raw = {
    title: String(formData.get('title') ?? ''),
    slug: String(formData.get('slug') ?? ''),
    description: String(formData.get('description') ?? ''),
    price_cents: Number(formData.get('price_cents') ?? 0),
    currency: String(formData.get('currency') ?? 'eur'),
    is_published: formData.get('is_published') === 'true',
    cover_url: String(formData.get('cover_url') ?? ''),
  }

  const parsed = courseSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await db.from('courses').update(parsed.data).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/courses')
  revalidatePath('/')
  revalidatePath('/cursos')
  revalidatePath(`/courses/${parsed.data.slug}`)

  return { success: 'Curso actualizado' }
}

export async function deleteCourseAction(id: string) {
  await requireAdmin()
  const db = createAdminClient()

  // Limpiar cover del bucket (archivos en covers/courseId/)
  const { data: coverFiles } = await db.storage.from('covers').list(id)
  if (coverFiles?.length) {
    await db.storage.from('covers').remove(coverFiles.map((f) => `${id}/${f.name}`))
  }

  // Obtener los paths de notas de todas las lecciones del curso
  const { data: lessons } = await db
    .from('lessons')
    .select('notes_pdf_path')
    .eq('course_id', id)
    .not('notes_pdf_path', 'is', null)

  const notePaths = (lessons ?? []).map((l) => l.notes_pdf_path).filter(Boolean) as string[]
  if (notePaths.length) {
    await db.storage.from('notes').remove(notePaths)
  }

  await db.from('courses').delete().eq('id', id)
  revalidatePath('/admin/courses')
  revalidatePath('/')
  revalidatePath('/cursos')

  redirect('/admin/courses')
}

export async function uploadCoverAction(courseId: string, formData: FormData) {
  await requireAdmin()
  const db = createAdminClient()

  const file = formData.get('cover') as File
  if (!file || file.size === 0) return { error: 'Selecciona un archivo' }
  if (!file.type.startsWith('image/')) return { error: 'Solo se permiten imágenes' }
  if (file.size > 5 * 1024 * 1024) return { error: 'La imagen no puede superar 5 MB' }

  const ext = file.name.split('.').pop()
  const path = `${courseId}/cover.${ext}`
  const buffer = await file.arrayBuffer()

  const { error: uploadError } = await db.storage
    .from('covers')
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (uploadError) return { error: uploadError.message }

  const { data: urlData } = db.storage.from('covers').getPublicUrl(path)

  await db.from('courses').update({ cover_url: urlData.publicUrl }).eq('id', courseId)
  revalidatePath('/admin/courses')
  revalidatePath('/')

  return { success: urlData.publicUrl }
}

// ── Lecciones ─────────────────────────────────────────────

const lessonSchema = z.object({
  title: z.string().min(2, 'El título debe tener al menos 2 caracteres'),
  description: z.string().default(''),
  youtube_video_id: z.string().min(5, 'ID de YouTube inválido'),
  position: z.coerce.number().int().min(1),
  min_watch_seconds: z.coerce.number().int().min(0),
})

export async function createLessonAction(_prev: unknown, formData: FormData) {
  await requireAdmin()
  const db = createAdminClient()

  const courseId = String(formData.get('course_id'))
  const raw = {
    title: String(formData.get('title') ?? ''),
    description: String(formData.get('description') ?? ''),
    youtube_video_id: String(formData.get('youtube_video_id') ?? ''),
    position: Number(formData.get('position') ?? 1),
    min_watch_seconds: Number(formData.get('min_watch_minutes') ?? 0) * 60,
  }

  const parsed = lessonSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await db
    .from('lessons')
    .insert({ ...parsed.data, course_id: courseId })

  if (error) {
    if (error.message.includes('unique')) return { error: 'Ya existe una lección en esa posición' }
    return { error: error.message }
  }

  revalidatePath(`/admin/courses/${courseId}`)
  return { success: 'Lección creada' }
}

export async function updateLessonAction(_prev: unknown, formData: FormData) {
  await requireAdmin()
  const db = createAdminClient()

  const id = String(formData.get('id'))
  const courseId = String(formData.get('course_id'))
  const raw = {
    title: String(formData.get('title') ?? ''),
    description: String(formData.get('description') ?? ''),
    youtube_video_id: String(formData.get('youtube_video_id') ?? ''),
    position: Number(formData.get('position') ?? 1),
    min_watch_seconds: Number(formData.get('min_watch_minutes') ?? 0) * 60,
  }

  const parsed = lessonSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await db.from('lessons').update(parsed.data).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath(`/admin/courses/${courseId}`)
  return { success: 'Lección actualizada' }
}

export async function deleteLessonAction(id: string, courseId: string) {
  await requireAdmin()
  const db = createAdminClient()

  // Limpiar apuntes PDF del bucket antes de eliminar la lección
  const { data: lesson } = await db.from('lessons').select('notes_pdf_path').eq('id', id).single()
  if (lesson?.notes_pdf_path) {
    await db.storage.from('notes').remove([lesson.notes_pdf_path])
  }

  await db.from('lessons').delete().eq('id', id)
  revalidatePath(`/admin/courses/${courseId}`)
}

export async function uploadNotesAction(lessonId: string, courseId: string, formData: FormData) {
  await requireAdmin()
  const db = createAdminClient()

  const file = formData.get('notes') as File
  if (!file || file.size === 0) return { error: 'Selecciona un archivo PDF' }
  if (file.type !== 'application/pdf') return { error: 'Solo se permiten archivos PDF' }
  if (file.size > 20 * 1024 * 1024) return { error: 'El PDF no puede superar 20 MB' }

  const path = `${courseId}/${lessonId}/notes.pdf`
  const buffer = await file.arrayBuffer()

  const { error: uploadError } = await db.storage
    .from('notes')
    .upload(path, buffer, { contentType: 'application/pdf', upsert: true })

  if (uploadError) return { error: uploadError.message }

  await db.from('lessons').update({ notes_pdf_path: path }).eq('id', lessonId)
  revalidatePath(`/admin/courses/${courseId}`)
  return { success: 'Apuntes subidos' }
}

export async function removeNotesAction(lessonId: string, courseId: string, path: string) {
  await requireAdmin()
  const db = createAdminClient()
  await db.storage.from('notes').remove([path])
  await db.from('lessons').update({ notes_pdf_path: null }).eq('id', lessonId)
  revalidatePath(`/admin/courses/${courseId}`)
}

export async function toggleCoursePublishedAction(courseId: string, currentlyPublished: boolean) {
  await requireAdmin()
  const db = createAdminClient()
  const { data: course } = await db.from('courses').select('slug').eq('id', courseId).single()
  await db.from('courses').update({ is_published: !currentlyPublished }).eq('id', courseId)
  revalidatePath('/admin/courses')
  revalidatePath('/')
  revalidatePath('/cursos')
  if (course?.slug) revalidatePath(`/courses/${course.slug}`)
}

// ── Usuarios ───────────────────────────────────────────────

export async function updateUserRoleAction(userId: string, role: 'admin' | 'student') {
  await requireAdmin()
  const db = createAdminClient()
  await db.from('profiles').update({ role }).eq('id', userId)
  revalidatePath('/admin/users')
}
