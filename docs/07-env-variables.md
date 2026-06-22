# Variables de entorno

## Archivo `.env.local` (desarrollo)

Crea este archivo en la raíz del proyecto. **Nunca lo subas a Git** (ya está en `.gitignore`).

```env
# ─── Supabase ─────────────────────────────────────────────
# URL del proyecto Supabase (Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://TU_REF.supabase.co

# Clave anon (pública) — respeta RLS
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Clave service_role (secreta) — bypasa RLS, solo servidor
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ─── Stripe ───────────────────────────────────────────────
# Dashboard → Developers → API keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Dashboard → Developers → Webhooks → Signing secret
STRIPE_WEBHOOK_SECRET=whsec_...

# ─── App ──────────────────────────────────────────────────
# URL base (sin trailing slash). En local: http://localhost:3002
NEXT_PUBLIC_SITE_URL=http://localhost:3002
```

## Dónde obtener cada valor

### Supabase
1. Ve a [supabase.com](https://supabase.com) → tu proyecto
2. **Settings → API**
3. Copia `URL`, `anon public` y `service_role` (haz clic en "Reveal")

### Stripe
1. Ve a [dashboard.stripe.com](https://dashboard.stripe.com)
2. **Developers → API keys** → copia `Publishable key` y `Secret key`
3. Para el webhook secret: **Developers → Webhooks → Add endpoint**
   - URL: `https://TU_DOMINIO.vercel.app/api/webhooks/stripe`
   - Evento: `checkout.session.completed`
   - Copia el **Signing secret** (`whsec_...`)

---

## Variables en Vercel (producción)

En el dashboard de Vercel:
1. **Settings → Environment Variables**
2. Añadir una a una (no subas el `.env.local` directamente)
3. Aplica a: **Production**, **Preview** y **Development** según corresponda

| Variable | Production | Preview | Development |
|----------|-----------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | ✅ | ✅ |
| `STRIPE_SECRET_KEY` | ✅ (live) | ✅ (test) | — |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ (live) | ✅ (test) | — |
| `STRIPE_WEBHOOK_SECRET` | ✅ | ✅ | — |
| `NEXT_PUBLIC_SITE_URL` | ✅ | ✅ | — |

> En Preview, usa las claves de **test** de Stripe para poder probar pagos sin cargo real.

---

## Stripe: dos entornos

Stripe diferencia **Test** y **Live** (producción real con pagos reales):

- **Test**: claves `sk_test_...` / `pk_test_...` — usa tarjetas de prueba como `4242 4242 4242 4242`
- **Live**: claves `sk_live_...` / `pk_live_...` — cobros reales a tarjetas reales

Cambia entre entornos en el toggle **Test mode / Live mode** del dashboard de Stripe.
