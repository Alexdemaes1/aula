'use client'

import { useTransition } from 'react'
import { updateUserRoleAction } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface RoleToggleProps {
  userId: string
  currentRole: string
}

export function RoleToggle({ userId, currentRole }: RoleToggleProps) {
  const [isPending, startTransition] = useTransition()
  const isAdmin = currentRole === 'admin'

  function toggle() {
    const newRole = isAdmin ? 'student' : 'admin'
    const msg = isAdmin ? '¿Quitar permisos de admin a este usuario?' : '¿Hacer admin a este usuario?'
    if (!confirm(msg)) return

    startTransition(async () => {
      await updateUserRoleAction(userId, newRole)
      toast.success(`Rol actualizado a ${newRole}`)
    })
  }

  return (
    <Button
      variant={isAdmin ? 'destructive' : 'outline'}
      size="sm"
      onClick={toggle}
      disabled={isPending}
    >
      {isPending ? <Loader2 className="size-3 animate-spin" /> : null}
      {isAdmin ? 'Quitar admin' : 'Hacer admin'}
    </Button>
  )
}
