import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { notify } from '@/lib/notify'
import { z } from 'zod'

// Heartbeat de reproducción (vídeo) o de lectura (texto): acumula tiempo.
const heartbeatSchema = z.object({
  lessonId: z.string().uuid(),
  deltaSeconds: z.number().int().min(0).max(15),
  position: z.number().int().min(0),
  reachedEnd: z.boolean(),
})

// Marcar una lección de texto como completada (botón del alumno).
const completeSchema = z.object({
  lessonId: z.string().uuid(),
  markComplete: z.literal(true),
})

const schema = z.union([completeSchema, heartbeatSchema])

export async function POST(request: NextRequest) {
  const user = await requireUser().catch(() => null)
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const { lessonId } = parsed.data
  const adminClient = createAdminClient()

  const [{ data: lesson }, { data: current }] = await Promise.all([
    adminClient.from('lessons').select('course_id, min_watch_seconds, content_type').eq('id', lessonId).single(),
    adminClient.from('lesson_progress').select('watched_seconds, last_position, completed').eq('user_id', user.id).eq('lesson_id', lessonId).maybeSingle(),
  ])

  if (!lesson) return NextResponse.json({ error: 'Lección no encontrada' }, { status: 404 })

  // Verificar matrícula
  const { data: enrollment } = await adminClient
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', lesson.course_id)
    .eq('status', 'active')
    .maybeSingle()

  if (!enrollment) return NextResponse.json({ error: 'Sin acceso' }, { status: 403 })

  // ── Modo "marcar completada" (lecciones de texto) ──
  if ('markComplete' in parsed.data) {
    if (lesson.content_type !== 'text') {
      return NextResponse.json({ error: 'Operación no válida para este tipo de lección' }, { status: 400 })
    }
    // Respetar el tiempo mínimo de lectura (el cliente envía un heartbeat de flush antes).
    if ((current?.watched_seconds ?? 0) < lesson.min_watch_seconds) {
      return NextResponse.json(
        { error: 'Aún no has alcanzado el tiempo mínimo de lectura' },
        { status: 400 }
      )
    }
    const { error } = await adminClient.from('lesson_progress').upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        watched_seconds: current?.watched_seconds ?? 0,
        last_position: current?.last_position ?? 0,
        completed: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,lesson_id' }
    )
    if (error) {
      console.error('[progress:complete]', error)
      notify('🚨 Error BD — progress', error.message, { priority: 4, tags: ['rotating_light'] })
      return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
    }
    return NextResponse.json({ completed: true })
  }

  // ── Modo heartbeat (vídeo y lectura de texto) ──
  const { deltaSeconds, position, reachedEnd } = parsed.data
  const prevWatched = current?.watched_seconds ?? 0
  const added = Math.min(deltaSeconds, 12) // tope anti-inflado
  const newWatched = prevWatched + added
  // El vídeo se autocompleta al llegar al final con el tiempo mínimo; el texto
  // NO (reachedEnd siempre false desde el lector de texto → se completa por botón).
  const completed = current?.completed || (newWatched >= lesson.min_watch_seconds && reachedEnd)

  const { error } = await adminClient.from('lesson_progress').upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      watched_seconds: newWatched,
      last_position: position,
      completed,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,lesson_id' }
  )

  if (error) {
    console.error('[progress]', error)
    notify('🚨 Error BD — progress', error.message, { priority: 4, tags: ['rotating_light'] })
    return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
  }

  return NextResponse.json({ watchedSeconds: newWatched, completed })
}
