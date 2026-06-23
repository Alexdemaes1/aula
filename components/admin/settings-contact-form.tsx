'use client'

import { useActionState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateSiteConfigAction } from '@/app/actions/admin'
import { toast } from 'sonner'

export function SettingsContactForm({ cfg }: { cfg: Record<string, string> }) {
  const [state, action, pending] = useActionState(updateSiteConfigAction, null)

  useEffect(() => {
    if (state?.message) toast.success(state.message)
    if (state?.error)   toast.error(state.error)
  }, [state])

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact_phone">Teléfono</Label>
          <Input id="contact_phone" name="contact_phone" defaultValue={cfg.contact_phone ?? ''} placeholder="696 799 639" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_email">Email de contacto</Label>
          <Input id="contact_email" name="contact_email" type="email" defaultValue={cfg.contact_email ?? ''} placeholder="info@ejemplo.com" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="contact_address">Dirección</Label>
          <Input id="contact_address" name="contact_address" defaultValue={cfg.contact_address ?? ''} placeholder="Calle Ejemplo 1, 46000 Valencia" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="schedule">Horario</Label>
          <Input id="schedule" name="schedule" defaultValue={cfg.schedule ?? ''} placeholder="Lunes a Viernes · 9:00 – 21:00" />
        </div>
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? 'Guardando…' : 'Guardar información de contacto'}
      </Button>
    </form>
  )
}
