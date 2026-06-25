import { NextRequest, NextResponse } from 'next/server'
import { createElement } from 'react'
import fs from 'fs'
import path from 'path'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { recordCompletionIfDone } from '@/lib/completion'
import { renderToBuffer } from '@react-pdf/renderer'
import { CertificateDocument } from '@/components/certificate/certificate-document'

export const runtime = 'nodejs' // @react-pdf necesita Node, no edge.
export const dynamic = 'force-dynamic'

interface Ctx {
  params: Promise<{ courseSlug: string }>
}

export async function GET(req: NextRequest, { params }: Ctx) {
  const { courseSlug } = await params
  const user = await requireUser().catch(() => null)
  if (!user) return NextResponse.redirect(new URL('/login', req.url))

  const db = createAdminClient()
  const { data: course } = await db.from('courses').select('id, title').eq('slug', courseSlug).single()
  if (!course) return new NextResponse('Curso no encontrado', { status: 404 })

  // Verificar completación; si no hay fila pero el curso está realmente completo
  // (p.ej. completado antes de existir esta función), registrarla ahora.
  let { data: completion } = await db
    .from('course_completions')
    .select('completed_at, seconds_spent')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .maybeSingle()

  if (!completion) {
    await recordCompletionIfDone(user.id, course.id)
    const retry = await db
      .from('course_completions')
      .select('completed_at, seconds_spent')
      .eq('user_id', user.id)
      .eq('course_id', course.id)
      .maybeSingle()
    completion = retry.data
  }

  if (!completion) {
    return new NextResponse('Aún no has completado este curso', { status: 403 })
  }

  const { data: profile } = await db.from('profiles').select('full_name').eq('id', user.id).single()

  // Logo como data-URI (las URLs relativas no resuelven en el runtime del PDF).
  let logo: string | undefined
  try {
    const buf = fs.readFileSync(path.join(process.cwd(), 'public', 'logo.png'))
    logo = `data:image/png;base64,${buf.toString('base64')}`
  } catch {
    logo = undefined
  }

  const element = createElement(CertificateDocument, {
    studentName: profile?.full_name?.trim() || 'Alumno/a',
    courseTitle: course.title,
    completedAt: completion.completed_at,
    secondsSpent: completion.seconds_spent,
    logo,
  })
  // @react-pdf tipa renderToBuffer para un <Document> directo; nuestro componente lo envuelve.
  const pdf = await renderToBuffer(element as Parameters<typeof renderToBuffer>[0])

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="certificado-${courseSlug}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
