'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { changePasswordAction, resendVerificationAction } from '@/app/actions/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, KeyRound, ShieldCheck, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'

export function AccountSecurity({ emailVerified }: { emailVerified: boolean }) {
  const [state, formAction, pending] = useActionState(changePasswordAction, null)
  const [resending, startResend] = useTransition()
  const [formKey, setFormKey] = useState(0)

  useEffect(() => {
    if (state?.error) toast.error(state.error)
    if (state?.success) {
      toast.success(state.success)
      setFormKey((k) => k + 1) // limpia los campos
    }
  }, [state])

  function resend() {
    startResend(async () => {
      const r = await resendVerificationAction()
      if (r?.error) toast.error(r.error)
      else if (r?.success) toast.success(r.success)
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="size-4 text-primary" /> Seguridad
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estado de verificación de email */}
        <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
          <div className="flex items-center gap-2.5 text-sm">
            {emailVerified ? (
              <>
                <ShieldCheck className="size-4 text-emerald-600" />
                <span>Email verificado</span>
              </>
            ) : (
              <>
                <ShieldAlert className="size-4 text-amber-500" />
                <span>Email sin verificar</span>
              </>
            )}
          </div>
          {!emailVerified && (
            <Button variant="outline" size="sm" onClick={resend} disabled={resending}>
              {resending ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
              Reenviar
            </Button>
          )}
        </div>

        {/* Cambiar contraseña */}
        <form key={formKey} action={formAction} className="space-y-4">
          <p className="text-sm font-medium">Cambiar contraseña</p>
          <div className="space-y-2">
            <Label htmlFor="current_password">Contraseña actual</Label>
            <Input id="current_password" name="current_password" type="password" autoComplete="current-password" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new_password">Nueva contraseña</Label>
            <Input id="new_password" name="new_password" type="password" autoComplete="new-password" placeholder="Mínimo 6 caracteres" required />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
            Actualizar contraseña
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
