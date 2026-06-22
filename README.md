# Aula

Plataforma de cursos online con vídeo bajo demanda, pagos con Stripe y gestión completa desde un panel de administración.

## Stack

- **Next.js 16** (App Router) + **TypeScript** + **React 19**
- **Supabase** — base de datos PostgreSQL, autenticación y almacenamiento
- **Stripe** — pagos y webhooks
- **Tailwind CSS v4** + **shadcn/ui v4** (base-ui/react)

## Inicio rápido

```bash
# 1. Clonar e instalar
git clone https://github.com/TU_USUARIO/aula.git
cd aula
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local   # edita con tus claves reales

# 3. Arrancar
npx next dev -p 3002
```

Abre [http://localhost:3002](http://localhost:3002).

## Variables de entorno

Ver [`docs/07-env-variables.md`](docs/07-env-variables.md) para la lista completa y dónde obtener cada valor.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_SITE_URL=http://localhost:3002
```

## Despliegue

Ver [`docs/08-deployment.md`](docs/08-deployment.md) para el proceso completo con GitHub + Vercel.

El plan **Hobby de Vercel** (gratuito, sin tarjeta) es suficiente para empezar.

## Documentación

| Documento | Contenido |
|-----------|-----------|
| [`docs/01-architecture.md`](docs/01-architecture.md) | Stack, estructura de carpetas, flujo de datos |
| [`docs/02-features.md`](docs/02-features.md) | Funcionalidades completas y limitaciones conocidas |
| [`docs/03-database.md`](docs/03-database.md) | Esquema, triggers, RLS y Storage |
| [`docs/04-api.md`](docs/04-api.md) | Endpoints REST y Server Actions |
| [`docs/05-security.md`](docs/05-security.md) | Auditoría de seguridad y mejoras propuestas |
| [`docs/06-scalability.md`](docs/06-scalability.md) | Límites de planes gratuitos y proyección de crecimiento |
| [`docs/07-env-variables.md`](docs/07-env-variables.md) | Variables de entorno y configuración de Stripe |
| [`docs/08-deployment.md`](docs/08-deployment.md) | GitHub, Vercel, multi-PC, CI/CD |
| [`docs/09-admin-guide.md`](docs/09-admin-guide.md) | Guía de uso del panel de administración |

## Funcionalidades principales

**Alumnos:** catálogo con búsqueda · detalle de curso · compra (gratis o Stripe) · reproductor YouTube con tracking de progreso · desbloqueo secuencial de lecciones · apuntes PDF descargables · dashboard de progreso

**Admins:** CRUD de cursos y lecciones · subida de portadas y PDFs · gestión de usuarios y roles · historial de compras e ingresos

## Base de datos

Ejecuta [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql) en el SQL Editor de Supabase para crear todas las tablas, triggers, funciones y políticas RLS.
