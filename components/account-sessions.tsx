'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MonitorSmartphone, Loader2 } from 'lucide-react'
import { signOutAllDevicesAction } from '@/app/actions/profile'

export function AccountSessions({ lastSignInAt }: { lastSignInAt: string | null }) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  const last = lastSignInAt
    ? new Date(lastSignInAt).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })
    : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MonitorSmartphone className="size-4 text-primary" /> Sesiones y dispositivos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {last && (
          <p className="text-sm text-muted-foreground">
            Última conexión: <span className="font-medium text-foreground">{last}</span>
          </p>
        )}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-muted-foreground">
            ¿Usaste un ordenador compartido? Cierra la sesión en todos los dispositivos.
          </p>
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            Cerrar sesión en todos
          </Button>
        </div>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cerrar sesión en todos los dispositivos</DialogTitle>
            <DialogDescription>
              Se cerrará tu sesión en este y en cualquier otro dispositivo. Tendrás que volver a
              iniciar sesión.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button
              onClick={() => startTransition(() => signOutAllDevicesAction())}
              disabled={pending}
            >
              {pending && <Loader2 className="size-4 mr-2 animate-spin" />}
              Cerrar todas las sesiones
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
