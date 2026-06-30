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

// Firma real (magic bytes) de la imagen, no el content-type del cliente.
function sniffImage(b: Uint8Array): boolean {
  if (b.length < 12) return false
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return true // JPEG
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return true // PNG
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return true // GIF
  if (
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  ) return true // WEBP
  return false
}

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

/** Sube la foto de perfil (bucket público 'avatars'). La imagen llega ya
 *  redimensionada desde el cliente, así que es pequeña. */
export async function uploadAvatarAction(_prev: unknown, formData: FormData): Promise<Result> {
  const user = await requireUser()
  const file = formData.get('avatar') as File | null
  if (!file || file.size === 0) return { error: 'Selecciona una imagen' }
  if (file.size > 3 * 1024 * 1024) return { error: 'La imagen no puede superar 3 MB' }

  const buffer = await file.arrayBuffer()
  if (!sniffImage(new Uint8Array(buffer.slice(0, 16)))) {
    return { error: 'El archivo no parece una imagen válida (JPG, PNG o WebP)' }
  }
  const ext = (file.name.split('.').pop() ?? '').toLowerCase()
  const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg'
  const path = `${user.id}/avatar.${safeExt}`

  const db = createAdminClient()
  const { error: upErr } = await db.storage
    .from('avatars')
    .upload(path, buffer, { contentType: file.type || 'image/jpeg', upsert: true })
  if (upErr) return { error: upErr.message }

  // Eliminar otras extensiones antiguas del mismo usuario (evita huérfanos).
  const { data: existing } = await db.storage.from('avatars').list(user.id)
  const stale = (existing ?? [])
    .map((f) => `${user.id}/${f.name}`)
    .filter((p) => p !== path)
  if (stale.length) await db.storage.from('avatars').remove(stale)

  const { data: urlData } = db.storage.from('avatars').getPublicUrl(path)
  // ?t= rompe la caché de CDN/navegador al reemplazar la foto.
  const url = `${urlData.publicUrl}?t=${Date.now()}`

  const { error: dbErr } = await db
    .from('profiles')
    .upsert({ id: user.id, avatar_url: url }, { onConflict: 'id' })
  if (dbErr) return { error: dbErr.message }
  revalidatePath('/account')
  revalidatePath('/dashboard')
  return { success: 'Foto actualizada' }
}

/** Quita la foto de perfil (storage + columna). */
export async function removeAvatarAction(): Promise<Result> {
  const user = await requireUser()
  const db = createAdminClient()
  const { data: existing } = await db.storage.from('avatars').list(user.id)
  if (existing?.length) {
    await db.storage.from('avatars').remove(existing.map((f) => `${user.id}/${f.name}`))
  }
  await db.from('profiles').upsert({ id: user.id, avatar_url: null }, { onConflict: 'id' })
  revalidatePath('/account')
  revalidatePath('/dashboard')
  return { success: 'Foto eliminada' }
}

/** Guarda las preferencias de notificación (todo on/off). */
export async function updateNotificationPrefsAction(
  _prev: unknown,
  formData: FormData
): Promise<Result> {
  const user = await requireUser()
  const news = formData.get('notify_news') === 'true'
  const reminders = formData.get('notify_course_reminders') === 'true'

  const db = createAdminClient()
  const { error } = await db
    .from('profiles')
    .upsert({ id: user.id, notify_news: news, notify_course_reminders: reminders }, { onConflict: 'id' })
  if (error) return { error: error.message }
  revalidatePath('/account')
  return { success: 'Preferencias guardadas' }
}

/** Cierra la sesión en TODOS los dispositivos (revoca todos los tokens). */
export async function signOutAllDevicesAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut({ scope: 'global' }).catch(() => {})
  redirect('/login?signedout=all')
}
