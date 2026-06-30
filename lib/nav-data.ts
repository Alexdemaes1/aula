import { getUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export interface NavData {
  isLoggedIn: boolean
  isAdmin: boolean
  email?: string
  fullName?: string
  avatarUrl?: string | null
}

type ProfileRow = { role?: string; full_name?: string; avatar_url?: string | null } | null

/** Datos de navegación compartidos por todos los layouts (barra global). */
export async function getNavData(): Promise<NavData> {
  const user = await getUser()
  if (!user) return { isLoggedIn: false, isAdmin: false }

  const db = createAdminClient()
  // Defensivo: si avatar_url aún no existe (migración 015 sin aplicar), reintenta sin ella.
  const sel = await db.from('profiles').select('role, full_name, avatar_url').eq('id', user.id).single()
  let p: ProfileRow
  if (sel.error) {
    const fb = await db.from('profiles').select('role, full_name').eq('id', user.id).single()
    p = fb.data as ProfileRow
  } else {
    p = sel.data as ProfileRow
  }

  return {
    isLoggedIn: true,
    isAdmin: p?.role === 'admin',
    email: user.email ?? undefined,
    fullName: p?.full_name || undefined,
    avatarUrl: p?.avatar_url ?? null,
  }
}
