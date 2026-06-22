import { createAdminClient } from '@/lib/supabase/admin'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate } from '@/lib/utils/format'

export const metadata = { title: 'Compras — Admin' }

export default async function AdminPurchasesPage() {
  const db = createAdminClient()

  const { data: enrollments } = await db
    .from('enrollments')
    .select('*, courses(title, slug), profiles(full_name, id)')
    .order('purchased_at', { ascending: false })

  const { data: authUsers } = await db.auth.admin.listUsers()
  const emailMap = new Map((authUsers?.users ?? []).map((u) => [u.id, u.email]))

  const total = enrollments?.reduce((sum, e) => sum + (e.amount_paid_cents ?? 0), 0) ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Compras</h1>
        <p className="text-muted-foreground">
          {enrollments?.length ?? 0} matrículas · Total: {formatPrice(total)}
        </p>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Alumno</TableHead>
              <TableHead>Curso</TableHead>
              <TableHead>Importe</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!enrollments?.length ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  Todavía no hay compras.
                </TableCell>
              </TableRow>
            ) : (
              enrollments.map((e) => {
                const profile = e.profiles as { full_name: string; id: string } | null
                return (
                  <TableRow key={e.id}>
                    <TableCell>
                      <div className="font-medium text-sm">{profile?.full_name || '—'}</div>
                      <div className="text-xs text-muted-foreground">
                        {emailMap.get(profile?.id ?? '') ?? '—'}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {(e.courses as any)?.title ?? '—'}
                    </TableCell>
                    <TableCell>{formatPrice(e.amount_paid_cents)}</TableCell>
                    <TableCell>
                      <Badge variant={e.status === 'active' ? 'default' : 'secondary'}>
                        {e.status === 'active' ? 'Activa' : 'Reembolsada'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(e.purchased_at)}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
