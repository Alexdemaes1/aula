import { createAdminClient } from '@/lib/supabase/admin'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { formatPrice, formatDate } from '@/lib/utils/format'
import { PurchasesFilter } from '@/components/admin/purchases-filter'
import { RefundButton } from '@/components/admin/refund-button'
import { Download } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Compras — Admin' }

interface PageProps {
  searchParams: Promise<{ curso?: string; estado?: string }>
}

export default async function AdminPurchasesPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const db = createAdminClient()

  const [coursesResult, authUsersResult] = await Promise.all([
    db.from('courses').select('id, title').order('title'),
    db.auth.admin.listUsers(),
  ])

  const courses = coursesResult.data ?? []
  const emailMap = new Map((authUsersResult.data?.users ?? []).map(u => [u.id, u.email]))

  let query = db
    .from('enrollments')
    .select('*, courses(id, title), profiles(full_name, id)')
    .order('purchased_at', { ascending: false })

  if (sp.curso)  query = query.eq('course_id', sp.curso)
  if (sp.estado) query = query.eq('status', sp.estado)

  const { data: enrollments } = await query

  const total = enrollments?.filter(e => e.status === 'active').reduce((sum, e) => sum + (e.amount_paid_cents ?? 0), 0) ?? 0

  const exportParams = new URLSearchParams()
  if (sp.curso)  exportParams.set('curso', sp.curso)
  if (sp.estado) exportParams.set('estado', sp.estado)
  const exportHref = `/api/admin/export-purchases${exportParams.size ? `?${exportParams}` : ''}`

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Compras</h1>
          <p className="text-muted-foreground">
            {enrollments?.length ?? 0} matrículas · Total activas: {formatPrice(total)}
          </p>
        </div>
        <Link href={exportHref} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          <Download className="size-4 mr-1.5" />
          Exportar CSV
        </Link>
      </div>

      <PurchasesFilter
        courses={courses}
        selectedCourse={sp.curso}
        selectedEstado={sp.estado}
      />

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Alumno</TableHead>
              <TableHead>Curso</TableHead>
              <TableHead>Importe</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="w-32" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {!enrollments?.length ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No hay compras con estos filtros.
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
                      {(e.courses as { title: string } | null)?.title ?? '—'}
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
                    <TableCell>
                      <RefundButton
                        enrollmentId={e.id}
                        amountCents={e.amount_paid_cents ?? 0}
                        status={e.status}
                        hasPaymentIntent={!!e.payment_intent_id}
                      />
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
