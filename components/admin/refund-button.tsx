'use client'

import { useState, useTransition } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { refundEnrollmentAction } from '@/app/actions/admin'
import { toast } from 'sonner'

interface RefundButtonProps {
  enrollmentId: string
  amountCents: number
  status: string
  hasPaymentIntent: boolean
}

export function RefundButton({ enrollmentId, amountCents, status, hasPaymentIntent }: RefundButtonProps) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  if (status === 'refunded') {
    return <span className="text-xs text-muted-foreground">Reembolsada</span>
  }

  if (!hasPaymentIntent) {
    return (
      <span className="text-xs text-muted-foreground" title="Sin payment_intent — reembolso manual en Stripe">
        Manual
      </span>
    )
  }

  function handleRefund() {
    startTransition(async () => {
      const result = await refundEnrollmentAction(enrollmentId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Reembolso procesado correctamente')
        setOpen(false)
      }
    })
  }

  const euros = (amountCents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
        onClick={() => setOpen(true)}
        type="button"
      >
        <RotateCcw className="size-3 mr-1" />
        Reembolsar
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar reembolso</DialogTitle>
            <DialogDescription>
              Se devolverán <strong>{euros}</strong> al método de pago original a través de Stripe.
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" size="sm" disabled={pending} onClick={handleRefund}>
              {pending ? 'Procesando…' : 'Confirmar reembolso'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
