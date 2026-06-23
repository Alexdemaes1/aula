import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { notify } from '@/lib/notify'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) return NextResponse.json({ error: 'Sin firma' }, { status: 400 })

  let event
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('[webhook] Firma inválida:', err)
    return NextResponse.json({ error: 'Firma inválida' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { user_id, course_id } = session.metadata ?? {}

    if (!user_id || !course_id) {
      console.error('[webhook] Metadata incompleta', session.id)
      notify('⚠️ Webhook Stripe — metadata incompleta', `Session: ${session.id}`, { priority: 4, tags: ['warning'] })
      return NextResponse.json({ error: 'Metadata incompleta' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Obtener nombre del curso para la notificación
    const { data: course } = await adminClient.from('courses').select('title').eq('id', course_id).single()

    const { error } = await adminClient.from('enrollments').insert({
      user_id,
      course_id,
      status: 'active',
      amount_paid_cents: session.amount_total ?? 0,
      stripe_session_id: session.id,
      payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
    })

    if (error) {
      // Replay de Stripe: matrícula ya existe → idempotente, no notificar de nuevo
      if (error.message.includes('duplicate') || error.code === '23505') {
        return NextResponse.json({ received: true })
      }
      console.error('[webhook] Error al matricular:', error)
      notify('🚨 Webhook Stripe — error al matricular', `${error.message}\nSession: ${session.id}`, { priority: 5, tags: ['rotating_light'] })
      return NextResponse.json({ error: 'Error al procesar' }, { status: 500 })
    }

    const euros = ((session.amount_total ?? 0) / 100).toFixed(2)
    notify(
      `💰 Nueva venta — ${euros} €`,
      `Curso: "${course?.title ?? course_id}"\nSession: ${session.id}`,
      { priority: 4, tags: ['moneybag'] }
    )
  }

  return NextResponse.json({ received: true })
}
