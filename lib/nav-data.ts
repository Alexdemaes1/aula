import { unstable_cache } from 'next/cache'
import { getUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

function getCachedUserRole(userId: string) {
  return unstable_cache(
    async () => {
      const db = createAdminClient()
      const { data } = await db.from('profiles').select('role').eq('id', userId).single()
      return data?.role ?? null
    },
    [`profile-role-${userId}`],
    { revalidate: 60 }
  )()
}

export interface NavData {
  isLoggedIn: boolean
  isAdmin: boolean
  email?: string
}

/** Datos de navegación compartidos por todos los layouts (barra global). */
export async function getNavData(): Promise<NavData> {
  const user = await getUser()
  if (!user) return { isLoggedIn: false, isAdmin: false }
  const role = await getCachedUserRole(user.id)
  return { isLoggedIn: true, isAdmin: role === 'admin', email: user.email ?? undefined }
}
