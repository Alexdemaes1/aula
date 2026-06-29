'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notify } from '@/lib/notify'
import { sendEmail, welcomeEmail } from '@/lib/email'

// Devuelve la URL base del dominio actual del request (resuelve el problema de PKCE:
// el code_verifier se guarda en cookie del dominio donde se hace signup, así que
// emailRedirectTo debe apuntar al mismo dominio para que el callback lo encuentre).
async function getSiteUrl(): Promise<string> {
  const hdrs = await headers()
  const host = hdrs.get('x-forwarded-host') ?? hdrs.get('host') ?? 'localhost:3000'
  const proto = host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https'
  return `${proto}://${host}`
}

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

const registerSchema = z.object({
  full_name: z.string().min(2, 'Introduce tu nombre completo'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type ActionState = { error?: string; success?: string } | null

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return { error: 'Email o contraseña incorrectos' }
  }

  const next = String(formData.get('next') ?? '').trim()
  // Evita open redirect: solo rutas internas (no "//host" ni "/\\host" protocol-relative).
  const safeNext =
    next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\') ? next : '/dashboard'
  redirect(safeNext)
}

export async function registerAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    full_name: formData.get('full_name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  if (formData.get('accept_terms') == null) {
    return { error: 'Debes aceptar los términos y la política de privacidad' }
  }

  const siteUrl = await getSiteUrl()
  const supabase = await createClient()
  const { data: signUpData, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.full_name },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Guardar nombre explícitamente; el trigger de DB puede no copiarlo de user_metadata
  if (signUpData.user?.id) {
    const admin = createAdminClient()
    await admin
      .from('profiles')
      .upsert(
        { id: signUpData.user.id, full_name: parsed.data.full_name, terms_accepted_at: new Date().toISOString() },
        { onConflict: 'id' }
      )
  }

  notify('👤 Nuevo registro', `${parsed.data.email} (${parsed.data.full_name})`, {
    priority: 2,
    tags: ['wave'],
  })

  const w = welcomeEmail(parsed.data.full_name)
  await sendEmail(parsed.data.email, w.subject, w.html)

  return { success: 'Revisa tu email y haz clic en el enlace de confirmación.' }
}

export async function forgotPasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get('email') ?? '')

  if (!z.string().email().safeParse(email).success) {
    return { error: 'Introduce un email válido' }
  }

  const siteUrl = await getSiteUrl()
  const supabase = await createClient()
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  })

  // Siempre devolvemos éxito (no revelar si el email existe)
  return { success: 'Si ese email está registrado, recibirás un enlace en breve.' }
}

export async function resetPasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const password = String(formData.get('password') ?? '')
  const confirm = String(formData.get('confirm') ?? '')

  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres' }
  }

  if (password !== confirm) {
    return { error: 'Las contraseñas no coinciden' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: 'El enlace ha caducado. Solicita uno nuevo.' }
  }

  redirect('/dashboard')
}

export async function logoutAction(): Promise<void> {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch {
    // Si signOut falla (red/cookies), redirigimos igualmente a la home pública.
  }
  redirect('/')
}
