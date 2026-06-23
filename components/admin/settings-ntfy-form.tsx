'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateSiteConfigAction, testNotifyAction } from '@/app/actions/admin'
import { toast } from 'sonner'

export function SettingsNtfyForm({ cfg }: { cfg: Record<string, string> }) {
  const [state, action, pending] = useActionState(updateSiteConfigAction, null)
  const [testPending, startTest] = useTransition()
  const [topic, setTopic] = useState(cfg.ntfy_topic ?? '')

  useEffect(() => {
    if (state?.message) toast.success(state.message)
    if (state?.error)   toast.error(state.error)
  }, [state])

  function handleTest() {
    startTest(async () => {
      const result = await testNotifyAction()
      if (result.message) toast.success(result.message)
      if (result.error)   toast.error(result.error)
    })
  }

  return (
    <div className="space-y-4">
      <form action={action} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ntfy_topic">Topic de ntfy.sh</Label>
          <Input
            id="ntfy_topic"
            name="ntfy_topic"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="mi-topic-secreto"
          />
          {topic && (
            <p className="text-xs text-muted-foreground font-mono">
              https://ntfy.sh/{topic}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? 'Guardando…' : 'Guardar topic'}
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={testPending} onClick={handleTest}>
            {testPending ? 'Enviando…' : 'Enviar prueba'}
          </Button>
        </div>
      </form>
    </div>
  )
}
