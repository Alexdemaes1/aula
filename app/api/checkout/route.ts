import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe'
import { notify } from '@/lib/notify'
import { z } from 'zod'

const schema = z.object({ courseId: z.string().uuid() })

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser().catch(() => null)
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

    const { courseId } = parsed.data

    const supabase = await createClient()
    const { data: course } = await supabase
      .from('courses')
      .select('id, title, price_cents, currency, slug, is_published')
      .eq('id', courseId)
      .eq('is_published', true)
      .single()

    if (!course) return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 })

    // Verificar que no esté ya matriculado
    const adminClient = createAdminClient()
    const { data: existing } = await adminClient
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .eq('status', 'active')
      .maybeSingle()

    if (existing) return NextResponse.json({ error: 'Ya tienes acceso a este curso' }, { status: 400 })

    // Si el curso es gratis, matricular directamente
    if (course.price_cents === 0) {
      await adminClient.from('enrollments').insert({
        user_id: user.id,
        course_id: courseId,
        status: 'active',
        amount_paid_cents: 0,
      })
      notify('🎓 Nueva matrícula (gratis)', `${user.email} se inscribió en "${course.title}"`, {
        priority: 3,
        tags: ['tada'],
      })
      return NextResponse.json({ url: `/courses/${course.slug}?compra=ok` })
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      customer_email: user.email ?? undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: course.currency,
            unit_amount: course.price_cents,
            product_data: { name: course.title },
          },
        },
      ],
      metadata: { user_id: user.id, course_id: course.id },
      success_url: `${siteUrl}/courses/${course.slug}?compra=ok`,
      cancel_url: `${siteUrl}/courses/${course.slug}?compra=cancelada`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[checkout]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
