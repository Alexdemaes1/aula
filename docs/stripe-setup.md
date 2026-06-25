# Configuración de Stripe — Guía para el cliente (Centro Tian Ying Fa)

Esta guía explica cómo dejar los pagos operativos. **El desarrollador se encarga de la
configuración técnica**; el cliente solo necesita crear la cuenta y conceder acceso.

> 🔒 **Seguridad:** las claves secretas de Stripe **nunca** se guardan en la web ni en la
> base de datos. Viven en variables de entorno del servidor (Vercel). No las compartas por
> email ni chat sin cifrar.

---

## Paso 1 — Crear la cuenta de Stripe (cliente)
1. Entra en https://dashboard.stripe.com/register
2. Regístrate con el email del centro.
3. Completa la **activación de la cuenta**: datos fiscales del negocio (autónomo o empresa),
   cuenta bancaria donde recibir los ingresos, y verificación de identidad. Sin esto, Stripe
   solo funciona en modo prueba y no se cobra de verdad.

## Paso 2 — Dar acceso al desarrollador (cliente)
Opción recomendada (más cómoda y segura):
1. En el Dashboard de Stripe → **Settings → Team and security → Team members**.
2. **Invitar miembro** con el email del desarrollador, rol *Developer* o *Administrator*.
3. El desarrollador obtiene las claves directamente, sin que el cliente las manipule.

Alternativa: el cliente comparte las claves del Paso 3 por un canal seguro (gestor de
contraseñas compartido). En ese caso, usar **claves restringidas** si es posible.

## Paso 3 — Claves necesarias (desarrollador)
Desde Stripe Dashboard → **Developers → API keys**:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → "Publishable key" (`pk_live_...`). Es pública.
- `STRIPE_SECRET_KEY` → "Secret key" (`sk_live_...`). **Secreta.**

## Paso 4 — Webhook (desarrollador)
Stripe debe avisar a la web cuando se completa un pago.
1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**.
2. URL del endpoint: `https://TU-DOMINIO/api/webhooks/stripe`
   (p. ej. `https://aula-kappa-nine.vercel.app/api/webhooks/stripe` o el dominio final).
3. Evento a escuchar: **`checkout.session.completed`**.
4. Copiar el **Signing secret** del webhook (`whsec_...`) → variable `STRIPE_WEBHOOK_SECRET`.

## Paso 5 — Variables en Vercel (desarrollador)
En Vercel → proyecto → **Settings → Environment Variables**, añadir (entorno *Production*):

| Variable | Valor |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |

Tras guardar, **redesplegar** el proyecto para que tomen efecto.

## Modo prueba vs producción
- Claves `..._test_...` → pagos simulados (tarjeta de prueba `4242 4242 4242 4242`). Ideal
  para validar el flujo sin cobrar.
- Claves `..._live_...` → cobros reales. Requiere la cuenta activada (Paso 1).
- El panel de admin (**Configuración**) muestra en qué modo está la web (🟡 test / 🟢 live).

## Comprobación final
1. Con claves *test*: comprar un curso con la tarjeta `4242...` → debe matricularte al instante.
2. Revisar en Stripe → Payments que aparece el pago.
3. Cambiar a claves *live* y hacer una compra real de prueba (se puede reembolsar desde el
   panel de admin → Compras).

## Comisiones (informativo)
Stripe no cobra cuota mensual; descuenta por transacción (~1,5 % + 0,25 € en tarjetas
europeas; algo más en tarjetas no-EU). El importe llega a la cuenta bancaria del centro
según el calendario de pagos de Stripe (normalmente cada pocos días).
