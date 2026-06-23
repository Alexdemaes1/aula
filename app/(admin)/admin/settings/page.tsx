import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SettingsContactForm } from '@/components/admin/settings-contact-form'
import { SettingsNtfyForm } from '@/components/admin/settings-ntfy-form'
import { SettingsStripeInfo } from '@/components/admin/settings-stripe-info'

export const metadata = { title: 'Configuración — Admin' }

export default async function SettingsPage() {
  const db = createAdminClient()
  const { data } = await db.from('site_config').select('key, value')
  const cfg = Object.fromEntries((data ?? []).map(r => [r.key, r.value]))

  const pubKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
  const secretKey = process.env.STRIPE_SECRET_KEY ?? ''
  const stripeMode: 'live' | 'test' | 'unconfigured' = secretKey.startsWith('sk_live_')
    ? 'live'
    : secretKey.startsWith('sk_test_')
    ? 'test'
    : 'unconfigured'

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Ajustes generales de la plataforma</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Información de contacto</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsContactForm cfg={cfg} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estado de Stripe</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsStripeInfo mode={stripeMode} pubKey={pubKey} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notificaciones push (ntfy.sh)</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsNtfyForm cfg={cfg} />
        </CardContent>
      </Card>
    </div>
  )
}
