'use server'

import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const schema = z.object({
  full_name: z.string().min(1, 'El nombre no puede estar vacío').max(100),
})

type Result = { error?: string; success?: string } | null

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Introduce tu contraseña actual'),
  new_password: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
})

/** Cambia la contraseña verificando antes la actual. */
export async function changePasswordAction(_prev: unknown, formData: FormData): Promise<Result> {
  const user = await requireUser()
  const parsed = passwordSchema.safeParse({
    current_password: formData.get('current_password'),
    new_password: formData.get('new_password'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  if (!user.email) return { error: 'No hay email asociado a la cuenta' }

  const supabase = await createClient()
  const { error: verifyErr } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.current_password,
  })
  if (verifyErr) return { error: 'La contraseña actual no es correcta' }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.new_password })
  if (error) return { error: error.message }
  return { success: 'Contraseña actualizada correctamente' }
}

/** Reenvía el email de verificación de la cuenta. */
export async function resendVerificationAction(): Promise<Result> {
  const user = await requireUser()
  if (!user.email) return { error: 'No hay email asociado a la cuenta' }
  const supabase = await createClient()
  const { error } = await supabase.auth.resend({ type: 'signup', email: user.email })
  if (error) return { error: 'No se pudo reenviar el email. Inténtalo más tarde.' }
  return { success: 'Email de verificación reenviado. Revisa tu bandeja.' }
}

/** Elimina la cuenta y todos sus datos (verifica contraseña antes). GDPR. */
export async function deleteAccountAction(_prev: unknown, formData: FormData): Promise<Result> {
  const user = await requireUser()
  if (!user.email) return { error: 'No hay email asociado a la cuenta' }
  const current = String(formData.get('current_password') ?? '')

  const supabase = await createClient()
  const { error: verifyErr } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: current,
  })
  if (verifyErr) return { error: 'Contraseña incorrecta' }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) return { error: 'No se pudo eliminar la cuenta. Inténtalo más tarde.' }

  await supabase.auth.signOut()
  redirect('/')
}

export async function updateProfileAction(_prev: unknown, formData: FormData) {
  const user = await requireUser()
  const parsed = schema.safeParse({ full_name: formData.get('full_name') })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const db = createAdminClient()
  const { error } = await db
    .from('profiles')
    .upsert({ id: user.id, full_name: parsed.data.full_name }, { onConflict: 'id' })

  if (error) return { error: error.message }
  revalidatePath('/account')
  revalidatePath('/dashboard')
  return { success: 'Nombre actualizado' }
}
