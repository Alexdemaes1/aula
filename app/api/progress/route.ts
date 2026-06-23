import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notify } from '@/lib/notify'
import { z } from 'zod'

const schema = z.object({
  lessonId: z.string().uuid(),
  deltaSeconds: z.number().int().min(0).max(10),
  position: z.number().int().min(0),
  reachedEnd: z.boolean(),
})

export async function POST(request: NextRequest) {
  const user = await requireUser().catch(() => null)
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const { lessonId, deltaSeconds, position, reachedEnd } = parsed.data

  const adminClient = createAdminClient()

  // Paralelo: lesson data + progreso actual (ambos solo necesitan lessonId + userId)
  const [{ data: lesson }, { data: current }] = await Promise.all([
    adminClient.from('lessons').select('course_id, min_watch_seconds').eq('id', lessonId).single(),
    adminClient.from('lesson_progress').select('watched_seconds, completed').eq('user_id', user.id).eq('lesson_id', lessonId).maybeSingle(),
  ])

  if (!lesson) return NextResponse.json({ error: 'Lección no encontrada' }, { status: 404 })

  // Verificar matrícula (necesita lesson.course_id)
  const { data: enrollment } = await adminClient
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', lesson.course_id)
    .eq('status', 'active')
    .maybeSingle()

  if (!enrollment) return NextResponse.json({ error: 'Sin acceso' }, { status: 403 })

  const prevWatched = current?.watched_seconds ?? 0
  // Tope anti-inflado: máximo 6 s por tick de 5 s
  const added = Math.min(deltaSeconds, 6)
  const newWatched = prevWatched + added
  const completed =
    current?.completed ||
    (newWatched >= lesson.min_watch_seconds && reachedEnd)

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
