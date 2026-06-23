'use server'

import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({
  full_name: z.string().min(1, 'El nombre no puede estar vacío').max(100),
})

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
