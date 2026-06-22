'use client'

import { useActionState, useEffect } from 'react'
import { updateProfileAction } from '@/app/actions/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

export function AccountForm({ userId, fullName }: { userId: string; fullName: string }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, null)

  useEffect(() => {
    if (state?.error) toast.error(state.error)
    if (state?.success) toast.success(state.success)
  }, [state])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Datos personales</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="user_id" value={userId} />
          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre completo</Label>
            <Input
              id="full_name"
              name="full_name"
              defaultValue={fullName}
              placeholder="Tu nombre"
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
            Guardar
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
