'use client'

import { useActionState, useEffect, useState } from 'react'
import { deleteAccountAction } from '@/app/actions/profile'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Loader2, Download, Trash2, Shield } from 'lucide-react'
import { toast } from 'sonner'

export function AccountDanger() {
  const [state, formAction, pending] = useActionState(deleteAccountAction, null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (state?.error) toast.error(state.error)
  }, [state])

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="size-4 text-primary" /> Privacidad y datos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Exportar mis datos</p>
            <p className="text-xs text-muted-foreground">Descarga en JSON tu perfil, compras y progreso.</p>
          </div>
          <a href="/api/account/export" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            <Download className="size-4 mr-1.5" /> Descargar
          </a>
        </div>

        <div className="flex items-center justify-between gap-3 border-t pt-4">
          <div>
            <p className="text-sm font-medium text-destructive">Eliminar mi cuenta</p>
            <p className="text-xs text-muted-foreground">Borra tu cuenta y todos tus datos. Es irreversible.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button variant="destructive" size="sm">
                  <Trash2 className="size-4 mr-1.5" /> Eliminar
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Eliminar cuenta</DialogTitle>
                <DialogDescription>
                  Esta acción es irreversible: se eliminarán tu cuenta, matrículas y progreso.
                  Introduce tu contraseña para confirmar.
                </DialogDescription>
              </DialogHeader>
              <form action={formAction} className="space-y-3">
                <Label htmlFor="del_pw" className="sr-only">Contraseña</Label>
                <Input
                  id="del_pw"
                  name="current_password"
                  type="password"
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                  required
                />
                <DialogFooter>
                  <DialogClose render={<Button type="button" variant="outline">Cancelar</Button>} />
                  <Button type="submit" variant="destructive" disabled={pending}>
                    {pending ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Trash2 className="size-4 mr-1.5" />}
                    Eliminar definitivamente
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
