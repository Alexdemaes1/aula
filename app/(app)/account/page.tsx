import Link from 'next/link'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { AccountForm } from '@/components/account-form'
import { AccountSecurity } from '@/components/account-security'
import { AccountDanger } from '@/components/account-danger'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils/format'

export const metadata = { title: 'Mi cuenta' }

export default async function AccountPage() {
  const user = await requireUser()
  const db = createAdminClient()

  const [{ data: profile }, { data: enrollments }] = await Promise.all([
    db.from('profiles').select('full_name, role, created_at').eq('id', user.id).single(),
    db
      .from('enrollments')
      .select('id, amount_paid_cents, status, purchased_at, courses(title, slug, currency)')
      .eq('user_id', user.id)
      .order('purchased_at', { ascending: false }),
  ])

  const emailVerified = Boolean(user.email_confirmed_at)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <Breadcrumbs items={[{ label: 'Inicio', href: '/' }, { label: 'Mi formación', href: '/dashboard' }, { label: 'Mi cuenta' }]} />
        <h1 className="font-heading text-3xl font-semibold">Mi cuenta</h1>
        <p className="text-muted-foreground mt-0.5">{user.email}</p>
      </div>

      <AccountForm userId={user.id} fullName={profile?.full_name ?? ''} />

      <AccountSecurity emailVerified={emailVerified} />

      {/* Mis compras */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="size-4 text-primary" /> Mis compras
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!enrollments?.length ? (
            <p className="text-sm text-muted-foreground">Todavía no has adquirido ningún curso.</p>
          ) : (
            <ul className="divide-y">
              {enrollments.map((e) => {
                const course = e.courses as unknown as { title: string; slug: string; currency: string } | null
                return (
                  <li key={e.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      {course ? (
                        <Link href={`/learn/${course.slug}`} className="text-sm font-medium hover:underline truncate block">
                          {course.title}
                        </Link>
                      ) : (
                        <span className="text-sm font-medium text-muted-foreground">Curso no disponible</span>
                      )}
                      <span className="text-xs text-muted-foreground">{formatDate(e.purchased_at)}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold">
                        {e.amount_paid_cents === 0 ? 'Gratis' : formatPrice(e.amount_paid_cents, course?.currency ?? 'eur')}
                      </div>
                      <Badge variant={e.status === 'active' ? 'secondary' : 'outline'} className="text-[10px]">
                        {e.status === 'active' ? 'Activa' : 'Reembolsada'}
                      </Badge>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <AccountDanger />
    </div>
  )
}
