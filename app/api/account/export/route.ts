import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GDPR: descarga en JSON de todos los datos del usuario autenticado.
export async function GET() {
  const user = await requireUser().catch(() => null)
  if (!user) return new NextResponse('No autenticado', { status: 401 })

  const db = createAdminClient()
  const [profile, enrollments, progress, completions, attempts] = await Promise.all([
    db.from('profiles').select('*').eq('id', user.id).single().then((r) => r.data),
    db.from('enrollments').select('*').eq('user_id', user.id).then((r) => r.data),
    db.from('lesson_progress').select('*').eq('user_id', user.id).then((r) => r.data),
    db.from('course_completions').select('*').eq('user_id', user.id).then((r) => r.data),
    db.from('quiz_attempts').select('*').eq('user_id', user.id).then((r) => r.data),
  ])

  const payload = {
    exportado_el: new Date().toISOString(),
    cuenta: { id: user.id, email: user.email, creada_el: user.created_at },
    perfil: profile,
    matriculas: enrollments,
    progreso_lecciones: progress,
    cursos_completados: completions,
    intentos_cuestionario: attempts,
  }

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': 'attachment; filename="mis-datos-tianyingfa.json"',
      'Cache-Control': 'private, no-store',
    },
  })
}
