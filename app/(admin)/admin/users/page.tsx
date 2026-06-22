import { createAdminClient } from '@/lib/supabase/admin'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { RoleToggle } from '@/components/admin/role-toggle'
import { formatDate } from '@/lib/utils/format'
import { requireAdmin } from '@/lib/auth'

export const metadata = { title: 'Usuarios — Admin' }

export default async function AdminUsersPage() {
  const currentUser = await requireAdmin()
  const db = createAdminClient()

  const { data: users } = await db
    .from('profiles')
    .select('*, auth_user:id(email)')
    .order('created_at', { ascending: false })

  // Obtener emails de auth.users
  const { data: authUsers } = await db.auth.admin.listUsers()
  const emailMap = new Map((authUsers?.users ?? []).map((u) => [u.id, u.email]))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <p className="text-muted-foreground">{users?.length ?? 0} usuarios registrados</p>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Registrado</TableHead>
              <TableHead className="w-32" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name || '—'}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {emailMap.get(user.id) ?? '—'}
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
                  {user.id !== currentUser.id && (
                    <RoleToggle userId={user.id} currentRole={user.role} />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
