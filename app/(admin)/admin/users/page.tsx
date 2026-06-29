import Link from 'next/link'
import { LineChart } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { RoleToggle } from '@/components/admin/role-toggle'
import { UserSearch } from '@/components/admin/user-search'
import { EnrollUserForm } from '@/components/admin/enroll-user-form'
import { formatDate } from '@/lib/utils/format'
import { requireAdmin } from '@/lib/auth'

export const metadata = { title: 'Usuarios — Admin' }

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const currentUser = await requireAdmin()
  const db = createAdminClient()

  let query = db
    .from('profiles')
    .select('*, enrollments(course_id, courses(title))')
    .order('created_at', { ascending: false })

  if (sp.q) query = query.ilike('full_name', `%${sp.q}%`)

  const [{ data: users }, { data: authUsers }, { data: courses }] = await Promise.all([
    query,
    db.auth.admin.listUsers(),
    db.from('courses').select('id, title').eq('is_published', true).order('title'),
  ])

  const emailMap = new Map((authUsers?.users ?? []).map(u => [u.id, u.email]))

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="kicker mb-1.5">Comunidad</p>
          <h1 className="font-heading text-3xl font-semibold">Usuarios</h1>
          <p className="text-muted-foreground mt-0.5">{users?.length ?? 0} usuarios{sp.q ? ` con "${sp.q}"` : ' registrados'}</p>
        </div>
        <UserSearch defaultValue={sp.q} />
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Cursos</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Registrado</TableHead>
              <TableHead className="w-40" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {!users?.length ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  {sp.q ? 'No se encontraron usuarios con ese nombre.' : 'No hay usuarios registrados.'}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const enrollments = (user.enrollments ?? []) as { course_id: string; courses: { title: string } | null }[]
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name || '—'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {emailMap.get(user.id) ?? '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {enrollments.slice(0, 3).map(e => (
                          <Badge key={e.course_id} variant="outline" className="text-xs font-normal">
                            {e.courses?.title ?? '—'}
                          </Badge>
                        ))}
                        {enrollments.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{enrollments.length - 3}</span>
                        )}
                        {enrollments.length === 0 && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                          title="Ver progreso"
                        >
                          <LineChart className="size-4" />
                        </Link>
                        {user.id !== currentUser.id && (
                          <RoleToggle userId={user.id} currentRole={user.role} />
                        )}
                        <EnrollUserForm
                          userId={user.id}
                          userName={user.full_name || emailMap.get(user.id) || 'Este usuario'}
                          courses={courses ?? []}
                        />
                      </div>
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
