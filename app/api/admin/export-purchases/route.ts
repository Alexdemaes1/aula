import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  await requireAdmin()
  const db = createAdminClient()
  const { searchParams } = new URL(request.url)

  let query = db
    .from('enrollments')
    .select('*, courses(title), profiles(full_name, id)')
    .order('purchased_at', { ascending: false })

  const curso = searchParams.get('curso')
  const estado = searchParams.get('estado')
  if (curso)  query = query.eq('course_id', curso)
  if (estado) query = query.eq('status', estado)

  const [{ data: enrollments }, { data: authData }] = await Promise.all([
    query,
    db.auth.admin.listUsers(),
  ])

  const emailMap = new Map((authData?.users ?? []).map(u => [u.id, u.email]))

  const header = 'Alumno,Email,Curso,Importe (EUR),Estado,Fecha'
  const rows = (enrollments ?? []).map(e => {
    const profile = e.profiles as { full_name: string; id: string } | null
    const course = e.courses as { title: string } | null
    return [
      `"${profile?.full_name ?? ''}"`,
      emailMap.get(profile?.id ?? '') ?? '',
      `"${course?.title ?? ''}"`,
      ((e.amount_paid_cents ?? 0) / 100).toFixed(2),
      e.status,
      new Date(e.purchased_at).toLocaleDateString('es-ES'),
    ].join(',')
  })

  const csv = [header, ...rows].join('\n')
  const date = new Date().toISOString().slice(0, 10)

  return new Response('﻿' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="compras-${date}.csv"`,
    },
  })
}
