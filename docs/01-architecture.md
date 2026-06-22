# Arquitectura técnica

## Stack

| Capa | Tecnología | Versión | Propósito |
|------|-----------|---------|-----------|
| Framework | Next.js (App Router) | 16.2.9 | SSR, Server Actions, API Routes |
| Runtime | React | 19.2.4 | UI |
| Lenguaje | TypeScript | 5.x | Tipado estático |
| Base de datos | Supabase (PostgreSQL) | — | Datos + Auth + Storage |
| Estilos | Tailwind CSS | v4 | Utilidades CSS |
| Componentes | shadcn/ui (Nova preset) | v4 | Componentes base-ui/react |
| Pagos | Stripe | v22 | Checkout y webhooks |
| Validación | Zod | v4 | Esquemas de entrada |
| Notificaciones | Sonner | v2 | Toasts |
| Iconos | Lucide React | v1 | Iconografía |

## Convenciones de Next.js 16

> ⚠️ Next.js 16 tiene cambios de ruptura respecto a versiones anteriores.

- **Middleware**: se llama `proxy.ts` en la raíz (no `middleware.ts`). Exporta `proxy` (no `default`).
- **Tailwind v4**: se importa con `@import "tailwindcss"` en globals.css. No existe `tailwind.config.js`.
- **shadcn/ui v4**: usa `@base-ui/react/button`. NO existe la prop `asChild`. Para usar `<Link>` con estilos de botón se utiliza `buttonVariants({...})`.
- **React 19**: `useRef<T>()` requiere valor inicial. `useSearchParams()` requiere `<Suspense>`.
- **Zod v4**: errores en `.issues[0].message` (no `.errors`).

## Estructura de carpetas

```
/
├── app/
│   ├── (public)/          # Catálogo y detalle de curso (sin auth requerida)
│   ├── (auth)/            # Login, registro, recuperación de contraseña
│   ├── (app)/             # Dashboard, cuenta, reproductor (requiere sesión)
│   ├── (admin)/           # Panel de administración (requiere rol admin)
│   ├── api/
│   │   ├── checkout/      # Inicia sesión de pago en Stripe
│   │   ├── progress/      # Registra progreso de visionado
│   │   └── webhooks/stripe/ # Recibe eventos de Stripe post-pago
│   ├── auth/callback/     # Intercambia código OAuth/magic-link por sesión
│   └── actions/           # Server Actions (auth, admin, profile, notes)
├── components/
│   ├── ui/                # Componentes shadcn/ui generados
│   ├── admin/             # Componentes específicos del panel admin
│   ├── navbar.tsx         # Barra de navegación (Server Component)
│   ├── lesson-sidebar.tsx # Sidebar de lecciones (Client Component)
│   ├── youtube-player.tsx # Reproductor YouTube con heartbeat (Client Component)
│   ├── buy-button.tsx     # Botón de compra (Client Component)
│   └── catalog-search.tsx # Búsqueda del catálogo (Client Component)
├── lib/
│   ├── supabase/
│   │   ├── client.ts      # Cliente browser (anon key)
│   │   ├── server.ts      # Cliente server components (anon key + cookies)
│   │   ├── admin.ts       # Cliente service_role (omite RLS, solo servidor)
│   │   └── middleware.ts  # Refresco de sesión en proxy
│   ├── auth.ts            # Helpers: getUser, requireUser, requireAdmin
│   ├── stripe.ts          # Instancia de Stripe con API version
│   └── utils/
│       └── format.ts      # formatPrice, formatDate, slugify
├── types/
│   └── index.ts           # Tipos TypeScript del dominio
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── docs/                  # Esta documentación
├── proxy.ts               # Middleware (protección de rutas)
└── next.config.ts         # Configuración Next.js + security headers
```

## Flujo de datos

```
Browser
  │
  ├─→ proxy.ts (edge)          # Refresca sesión, redirige si no auth
  │
  ├─→ Server Component (RSC)   # Renderiza con datos de Supabase (service_role)
  │     └─→ createAdminClient()  # Bypasa RLS, filtra por user.id en código
  │
  ├─→ Server Action             # Mutaciones desde formularios
  │     └─→ requireAdmin() / requireUser() → validateInput → createAdminClient()
  │
  └─→ API Route (/api/*)        # Llamadas fetch desde Client Components
        └─→ requireUser() → validar → createAdminClient()
```

## Autenticación

Supabase Auth con sesión basada en cookies HTTP-only (gestionadas por `@supabase/ssr`):

1. El usuario inicia sesión → `supabase.auth.signInWithPassword()` → cookies establecidas
2. En cada request, `proxy.ts` llama a `updateSession()` que refresca el token si está próximo a expirar
3. Server Components llaman a `requireUser()` / `requireAdmin()` antes de cualquier operación

El rol del usuario se almacena en `profiles.role` (no en el JWT de Supabase), así que requiere una consulta extra a la BD en `requireAdmin()`.

## Stripe Checkout

```
BuyButton → POST /api/checkout
  → Verificar auth y matrícula existente
  → Si precio = 0: insertar enrollment directamente
  → Si precio > 0: crear Stripe Checkout Session → redirigir a Stripe
  → Stripe redirige a /courses/[slug]?compra=ok

POST /api/webhooks/stripe (evento checkout.session.completed)
  → Verificar firma HMAC (STRIPE_WEBHOOK_SECRET)
  → Insertar enrollment con stripe_session_id (idempotente por UNIQUE constraint)
```

## Progreso de lecciones

```
YouTubePlayer (client)
  → onStateChange PLAYING: setInterval cada 5s → POST /api/progress {deltaSeconds:5, reachedEnd:false}
  → onStateChange ENDED:   POST /api/progress {deltaSeconds:0, reachedEnd:true}

/api/progress (server)
  → Verificar auth + matrícula activa
  → Obtener watched_seconds previo
  → Aplicar cap anti-inflado: Math.min(deltaSeconds, 6)
  → completed = prevCompleted || (newWatched >= min_watch_seconds && reachedEnd)
  → UPSERT en lesson_progress (onConflict: user_id,lesson_id)
  → Devolver {watchedSeconds, completed}

YouTubePlayer
  → Si completed y antes no lo era: router.refresh() + mostrar "Siguiente lección →"
```
