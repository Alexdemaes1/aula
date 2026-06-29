'use client'

import { updateUserRoleAction } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from 'sonner'

interface RoleToggleProps {
  userId: string
  currentRole: string
}

export function RoleToggle({ userId, currentRole }: RoleToggleProps) {
  const isAdmin = currentRole === 'admin'
  const newRole = isAdmin ? 'student' : 'admin'

  return (
    <ConfirmDialog
      trigger={
        <Button variant={isAdmin ? 'destructive' : 'outline'} size="sm">
          {isAdmin ? 'Quitar admin' : 'Hacer admin'}
        </Button>
      }
      title={isAdmin ? '¿Quitar permisos de admin?' : '¿Hacer admin a este usuario?'}
      description={
        isAdmin
          ? 'El usuario dejará de poder acceder al panel de administración.'
          : 'El usuario tendrá acceso completo al panel de administración.'
      }
      confirmText={isAdmin ? 'Quitar admin' : 'Hacer admin'}
      variant={isAdmin ? 'destructive' : 'default'}
      onConfirm={async () => {
        await updateUserRoleAction(userId, newRole)
        toast.success(`Rol actualizado a ${newRole}`)
      }}
    />
  )
}
