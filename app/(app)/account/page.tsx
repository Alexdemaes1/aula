import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { AccountForm } from '@/components/account-form'

export const metadata = { title: 'Mi cuenta' }

export default async function AccountPage() {
  const user = await requireUser()
  const db = createAdminClient()

  const { data: profile } = await db
    .from('profiles')
    .select('full_name, role, created_at')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Mi cuenta</h1>
        <p className="text-muted-foreground">{user.email}</p>
      </div>
      <AccountForm userId={user.id} fullName={profile?.full_name ?? ''} />
    </div>
  )
}
