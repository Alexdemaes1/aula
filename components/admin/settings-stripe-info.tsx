'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Copy, Check } from 'lucide-react'

interface SettingsStripeInfoProps {
  mode: 'live' | 'test' | 'unconfigured'
  pubKey: string
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  async function handleCopy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="ml-2 text-muted-foreground hover:text-foreground transition-colors shrink-0"
      aria-label="Copiar"
    >
      {copied ? <Check className="size-3.5 text-green-600" /> : <Copy className="size-3.5" />}
    </button>
  )
}

export function SettingsStripeInfo({ mode, pubKey }: SettingsStripeInfoProps) {
  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/webhooks/stripe`
    : '/api/webhooks/stripe'

  const badge = {
    live: <Badge className="bg-green-600 text-white">Live</Badge>,
    test: <Badge variant="secondary">Test</Badge>,
    unconfigured: <Badge variant="destructive">No configurado</Badge>,
  }[mode]

  const modeIcon = { live: '🟢', test: '🟡', unconfigured: '🔴' }[mode]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm">{modeIcon} Modo actual:</span>
        {badge}
      </div>

      {pubKey && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Clave pública (Stripe)</p>
          <div className="flex items-center gap-1">
            <code className="text-xs bg-muted px-2 py-1 rounded font-mono break-all flex-1">
              {pubKey}
            </code>
            <CopyButton value={pubKey} />
          </div>
        </div>
      )}

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">URL del webhook</p>
        <div className="flex items-center gap-1">
          <code className="text-xs bg-muted px-2 py-1 rounded font-mono break-all flex-1">
            {webhookUrl}
          </code>
          <CopyButton value={webhookUrl} />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Para cambiar entre test/live, actualiza las variables de entorno en Vercel y vuelve a desplegar.
      </p>
    </div>
  )
}
