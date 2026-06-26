'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { slugify } from '@/lib/utils/format'
import { extractYouTubeId } from '@/lib/utils/youtube'
import { getStripe } from '@/lib/stripe'
import { notify } from '@/lib/notify'
import { parseQuestions, type ParsedQuestion } from '@/lib/quiz/parse'

// ── Cursos ────────────────────────────────────────────────

// La portada se gestiona en la pestaña Portada y la publicación vía el checklist/toggle;
// por eso cover_url e is_published NO viajan en este formulario (una sola fuente de verdad).
const courseSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  description: z.string().default(''),
  price_cents: z.coerce.number().int().min(0),
  currency: z.string().default('eur'),
  cover_palette: z.enum(['jade', 'qigong', 'cream', 'dark', 'medicina']).catch('jade'),
  cover_character: z
    .string()
    .max(8)
    .default('')
    .refine((v) => v.trim() === '' || /^[㐀-鿿]{1,2}$/.test(v.trim()), 'Usa uno o dos caracteres chinos, o déjalo vacío'),
  is_featured: z.boolean().default(false),
  featured_order: z.number().int().min(0).nullable().default(null),
})

// Normaliza el payload del curso para la BD (carácter vacío → null).
function buildCoursePayload(d: z.infer<typeof courseSchema>) {
  return { ...d, cover_character: d.cover_character.trim() || null }
}

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
    cover_palette: String(formData.get('cover_palette') ?? 'jade'),
    cover_character: String(formData.get('cover_character') ?? ''),
    is_featured: formData.get('is_featured') != null,
    featured_order: formData.get('featured_order') ? Number(formData.get('featured_order')) : null,
  }

  const parsed = courseSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { data, error } = await db.from('courses').insert(buildCoursePayload(parsed.data)).select('id').single()
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
    cover_palette: String(formData.get('cover_palette') ?? 'jade'),
    cover_character: String(formData.get('cover_character') ?? ''),
    is_featured: formData.get('is_featured') != null,
    featured_order: formData.get('featured_order') ? Number(formData.get('featured_order')) : null,
  }

  const parsed = courseSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await db.from('courses').update(buildCoursePayload(parsed.data)).eq('id', id)
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

  if (uploadError) {
    console.error('[cover] upload error:', uploadError)
    return { error: uploadError.message }
  }

  const { data: urlData } = db.storage.from('covers').getPublicUrl(path)

  await db.from('courses').update({ cover_url: urlData.publicUrl }).eq('id', courseId)
  revalidatePath('/admin/courses')
  revalidatePath('/')

  return { success: urlData.publicUrl }
}

export async function setCoverUrlAction(
  courseId: string,
  url: string
): Promise<{ success?: string; error?: string }> {
  await requireAdmin()
  const db = createAdminClient()

  const parsed = z.string().url('URL de imagen inválida').safeParse(url.trim())
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await db.from('courses').update({ cover_url: parsed.data }).eq('id', courseId)
  if (error) return { error: error.message }

  revalidatePath('/admin/courses')
  revalidatePath('/')
  return { success: parsed.data }
}

// ── Lecciones ─────────────────────────────────────────────

// Schema condicional: vídeo ⇒ youtube_video_id; texto ⇒ body (coherente con el CHECK de la BD).
const lessonSchema = z.object({
  title: z.string().min(2, 'El título debe tener al menos 2 caracteres'),
  description: z.string().default(''),
  content_type: z.enum(['video', 'text']).default('video'),
  youtube_video_id: z.string().default(''),
  body: z.string().default(''),
  position: z.coerce.number().int().min(1),
  min_watch_seconds: z.coerce.number().int().min(0),
}).superRefine((v, ctx) => {
  if (v.content_type === 'video' && !extractYouTubeId(v.youtube_video_id)) {
    ctx.addIssue({ code: 'custom', path: ['youtube_video_id'], message: 'ID o enlace de YouTube inválido' })
  }
  if (v.content_type === 'text' && v.body.trim().length === 0) {
    ctx.addIssue({ code: 'custom', path: ['body'], message: 'El contenido de texto no puede estar vacío' })
  }
})

type LessonInput = z.infer<typeof lessonSchema>

// Construye el payload de columnas para la BD respetando la coherencia tipo⇄campos.
function buildLessonPayload(d: LessonInput) {
  return {
    title: d.title,
    description: d.description,
    content_type: d.content_type,
    youtube_video_id: d.content_type === 'video' ? extractYouTubeId(d.youtube_video_id) : null,
    body: d.content_type === 'text' ? d.body : null,
    position: d.position,
    min_watch_seconds: d.min_watch_seconds,
  }
}

function readLessonForm(formData: FormData) {
  return {
    title: String(formData.get('title') ?? ''),
    description: String(formData.get('description') ?? ''),
    content_type: String(formData.get('content_type') ?? 'video'),
    youtube_video_id: String(formData.get('youtube_video_id') ?? ''),
    body: String(formData.get('body') ?? ''),
    position: Number(formData.get('position') ?? 1),
    min_watch_seconds: Number(formData.get('min_watch_minutes') ?? 0) * 60,
  }
}

export async function createLessonAction(_prev: unknown, formData: FormData) {
  await requireAdmin()
  const db = createAdminClient()

  const courseId = String(formData.get('course_id'))
  const parsed = lessonSchema.safeParse(readLessonForm(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await db
    .from('lessons')
    .insert({ ...buildLessonPayload(parsed.data), course_id: courseId })

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
  const parsed = lessonSchema.safeParse(readLessonForm(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await db.from('lessons').update(buildLessonPayload(parsed.data)).eq('id', id)
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

// ── Matriculación manual ───────────────────────────────────

export async function manualEnrollAction(
  userId: string,
  courseId: string
): Promise<{ error?: string }> {
  await requireAdmin()
  const db = createAdminClient()
  const { error } = await db.from('enrollments').insert({
    user_id: userId,
    course_id: courseId,
    status: 'active',
    amount_paid_cents: 0,
  })
  if (error && error.code !== '23505') return { error: error.message }
  revalidatePath('/admin/users')
  revalidatePath('/admin/purchases')
  return {}
}

// ── Reembolso ─────────────────────────────────────────────

export async function refundEnrollmentAction(
  enrollmentId: string
): Promise<{ error?: string }> {
  await requireAdmin()
  const db = createAdminClient()

  const { data: enrollment } = await db
    .from('enrollments')
    .select('payment_intent_id, amount_paid_cents')
    .eq('id', enrollmentId)
    .single()

  if (!enrollment?.payment_intent_id) {
    return { error: 'Esta compra no tiene payment_intent_id. Procesa el reembolso manualmente en el panel de Stripe.' }
  }

  try {
    await getStripe().refunds.create({ payment_intent: enrollment.payment_intent_id })
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Error al procesar el reembolso en Stripe' }
  }

  await db.from('enrollments').update({ status: 'refunded' }).eq('id', enrollmentId)
  await notify('💸 Reembolso procesado', `Matrícula ${enrollmentId} — ${(enrollment.amount_paid_cents / 100).toFixed(2)} €`, { priority: 2, tags: ['arrows_counterclockwise'] })
  revalidatePath('/admin/purchases')
  return {}
}

// ── Reordenar lecciones ───────────────────────────────────

export async function reorderLessonAction(
  lessonId: string,
  direction: 'up' | 'down',
  courseId: string
): Promise<void> {
  await requireAdmin()
  const db = createAdminClient()

  const { data: current } = await db
    .from('lessons')
    .select('position')
    .eq('id', lessonId)
    .single()
  if (!current) return

  const targetPosition = current.position + (direction === 'down' ? 1 : -1)
  const { data: adjacent } = await db
    .from('lessons')
    .select('id')
    .eq('course_id', courseId)
    .eq('position', targetPosition)
    .single()
  if (!adjacent) return

  await db.rpc('swap_lesson_positions', { lesson_a: lessonId, lesson_b: adjacent.id })
  revalidatePath(`/admin/courses/${courseId}`)
}

// ── Configuración del sitio ───────────────────────────────

export async function updateSiteConfigAction(
  _prev: unknown,
  formData: FormData
): Promise<{ message?: string; error?: string }> {
  await requireAdmin()
  const db = createAdminClient()

  const keys = ['contact_phone', 'contact_email', 'contact_address', 'schedule', 'ntfy_topic']
  const rows = keys
    .filter(k => formData.has(k))
    .map(k => ({ key: k, value: String(formData.get(k) ?? ''), updated_at: new Date().toISOString() }))

  const { error } = await db.from('site_config').upsert(rows, { onConflict: 'key' })
  if (error) return { error: error.message }

  revalidatePath('/')
  return { message: 'Configuración guardada correctamente.' }
}

// ── Prueba de notificación ────────────────────────────────

export async function testNotifyAction(): Promise<{ message?: string; error?: string }> {
  await requireAdmin()
  try {
    await notify('🧪 Prueba', 'Panel admin Tian Ying Fa operativo', { priority: 3, tags: ['white_check_mark'] })
    return { message: 'Notificación enviada correctamente.' }
  } catch {
    return { error: 'No se pudo enviar la notificación. Comprueba el topic de ntfy.' }
  }
}

// ── Cuestionarios (admin) ─────────────────────────────────

type DbClient = ReturnType<typeof createAdminClient>

const optionInputSchema = z.object({
  label: z.string().trim().min(1, 'Hay una opción vacía'),
  isCorrect: z.boolean(),
})

const questionInputSchema = z.object({
  prompt: z.string().trim().min(3, 'El enunciado es demasiado corto'),
  type: z.enum(['single', 'multiple', 'boolean']),
  explanation: z.string().default(''),
  options: z.array(optionInputSchema).min(2, 'Se requieren al menos 2 opciones').max(6, 'Máximo 6 opciones'),
}).superRefine((v, ctx) => {
  const correct = v.options.filter(o => o.isCorrect).length
  if (v.type === 'multiple') {
    if (correct < 1) ctx.addIssue({ code: 'custom', message: 'Marca al menos una opción correcta' })
  } else if (correct !== 1) {
    ctx.addIssue({ code: 'custom', message: 'Debe haber exactamente una opción correcta' })
  }
})

function readQuestionForm(formData: FormData) {
  let options: unknown = []
  try {
    options = JSON.parse(String(formData.get('options') ?? '[]'))
  } catch {
    options = []
  }
  return {
    prompt: String(formData.get('prompt') ?? ''),
    type: String(formData.get('type') ?? 'single'),
    explanation: String(formData.get('explanation') ?? ''),
    options,
  }
}

// Devuelve el id del cuestionario del curso, creándolo si no existe.
async function getOrCreateQuiz(db: DbClient, courseId: string): Promise<string | null> {
  const { data: existing } = await db
    .from('quizzes')
    .select('id')
    .eq('course_id', courseId)
    .order('position')
    .limit(1)
    .maybeSingle()
  if (existing) return existing.id
  const { data: created } = await db.from('quizzes').insert({ course_id: courseId }).select('id').single()
  return created?.id ?? null
}

type QuestionPayload = Pick<ParsedQuestion, 'prompt' | 'type' | 'options'> & { explanation?: string }

async function insertQuestionWithOptions(
  db: DbClient,
  quizId: string,
  q: QuestionPayload,
  position: number
): Promise<{ message: string } | null> {
  const { data: question, error } = await db
    .from('quiz_questions')
    .insert({ quiz_id: quizId, prompt: q.prompt, type: q.type, explanation: q.explanation ?? '', position })
    .select('id')
    .single()
  if (error || !question) return error ?? { message: 'No se pudo crear la pregunta' }

  const optionRows = q.options.map((o, i) => ({
    question_id: question.id,
    label: o.label,
    is_correct: o.isCorrect,
    position: i + 1,
  }))
  const { error: optErr } = await db.from('quiz_options').insert(optionRows)
  return optErr ? { message: optErr.message } : null
}

export async function upsertQuizSettingsAction(
  _prev: unknown,
  formData: FormData
): Promise<{ message?: string; error?: string }> {
  await requireAdmin()
  const db = createAdminClient()

  const courseId = String(formData.get('course_id'))
  const title = String(formData.get('title') ?? 'Autoevaluación').trim() || 'Autoevaluación'
  const description = String(formData.get('description') ?? '')
  const passing = Math.max(0, Math.min(100, Number(formData.get('passing_score') ?? 70)))
  const maxRaw = String(formData.get('max_attempts') ?? '').trim()
  const maxAttempts = maxRaw === '' ? null : Math.max(1, Math.floor(Number(maxRaw)) || 1)
  const requiredForCompletion = String(formData.get('required_for_completion') ?? '') !== ''

  const quizId = await getOrCreateQuiz(db, courseId)
  if (!quizId) return { error: 'No se pudo crear el cuestionario' }

  const { error } = await db
    .from('quizzes')
    .update({
      title,
      description,
      passing_score: passing,
      max_attempts: maxAttempts,
      required_for_completion: requiredForCompletion,
    })
    .eq('id', quizId)
  if (error) return { error: error.message }

  revalidatePath(`/admin/courses/${courseId}`)
  return { message: 'Cuestionario guardado correctamente.' }
}

export async function createQuestionAction(
  _prev: unknown,
  formData: FormData
): Promise<{ success?: string; error?: string }> {
  await requireAdmin()
  const db = createAdminClient()

  const courseId = String(formData.get('course_id'))
  let quizId = String(formData.get('quiz_id') ?? '')
  if (!quizId) {
    const id = await getOrCreateQuiz(db, courseId)
    if (!id) return { error: 'No se pudo crear el cuestionario' }
    quizId = id
  }

  const parsed = questionInputSchema.safeParse(readQuestionForm(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { data: last } = await db
    .from('quiz_questions')
    .select('position')
    .eq('quiz_id', quizId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()
  const position = (last?.position ?? 0) + 1

  const err = await insertQuestionWithOptions(db, quizId, parsed.data, position)
  if (err) return { error: err.message }

  revalidatePath(`/admin/courses/${courseId}`)
  return { success: 'Pregunta añadida' }
}

export async function updateQuestionAction(
  _prev: unknown,
  formData: FormData
): Promise<{ success?: string; error?: string }> {
  await requireAdmin()
  const db = createAdminClient()

  const id = String(formData.get('id'))
  const courseId = String(formData.get('course_id'))
  const parsed = questionInputSchema.safeParse(readQuestionForm(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await db
    .from('quiz_questions')
    .update({ prompt: parsed.data.prompt, type: parsed.data.type, explanation: parsed.data.explanation })
    .eq('id', id)
  if (error) return { error: error.message }

  // Reemplazar opciones por completo (más simple que diff)
  await db.from('quiz_options').delete().eq('question_id', id)
  const optionRows = parsed.data.options.map((o, i) => ({
    question_id: id,
    label: o.label,
    is_correct: o.isCorrect,
    position: i + 1,
  }))
  const { error: optErr } = await db.from('quiz_options').insert(optionRows)
  if (optErr) return { error: optErr.message }

  revalidatePath(`/admin/courses/${courseId}`)
  return { success: 'Pregunta actualizada' }
}

export async function deleteQuestionAction(questionId: string, courseId: string): Promise<void> {
  await requireAdmin()
  const db = createAdminClient()
  await db.from('quiz_questions').delete().eq('id', questionId)
  revalidatePath(`/admin/courses/${courseId}`)
}

export async function reorderQuestionAction(
  questionId: string,
  direction: 'up' | 'down',
  courseId: string
): Promise<void> {
  await requireAdmin()
  const db = createAdminClient()

  const { data: current } = await db
    .from('quiz_questions')
    .select('position, quiz_id')
    .eq('id', questionId)
    .single()
  if (!current) return

  const targetPosition = current.position + (direction === 'down' ? 1 : -1)
  const { data: adjacent } = await db
    .from('quiz_questions')
    .select('id')
    .eq('quiz_id', current.quiz_id)
    .eq('position', targetPosition)
    .single()
  if (!adjacent) return

  await db.rpc('swap_question_positions', { question_a: questionId, question_b: adjacent.id })
  revalidatePath(`/admin/courses/${courseId}`)
}

export async function importQuizQuestionsAction(
  courseId: string,
  raw: string,
  replace: boolean
): Promise<{ imported: number; errors: { block: number; preview: string; message: string }[]; error?: string }> {
  await requireAdmin()
  const db = createAdminClient()

  const quizId = await getOrCreateQuiz(db, courseId)
  if (!quizId) return { imported: 0, errors: [], error: 'No se pudo crear el cuestionario' }

  const { questions, errors } = parseQuestions(raw)
  if (questions.length === 0) {
    return { imported: 0, errors, error: 'No se reconoció ninguna pregunta válida.' }
  }

  // Insertar las nuevas a partir de max+1; en modo reemplazo, borrar las antiguas
  // SOLO después de insertar con éxito (evita perder todo si una inserción falla a mitad).
  const { data: last } = await db
    .from('quiz_questions')
    .select('position')
    .eq('quiz_id', quizId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()
  const startPos = (last?.position ?? 0) + 1
  let position = startPos

  let imported = 0
  for (const q of questions) {
    const err = await insertQuestionWithOptions(db, quizId, q, position)
    if (!err) {
      imported++
      position++
    }
  }

  if (replace && imported > 0) {
    await db.from('quiz_questions').delete().eq('quiz_id', quizId).lt('position', startPos)
  }

  revalidatePath(`/admin/courses/${courseId}`)
  return { imported, errors }
}
