# 10 — Checklist de puesta en producción (v1 rediseño)

Pasos para dejar la plataforma lista para usuarios reales y cobros. Marca cada uno.

## 1. Base de datos (Supabase → SQL Editor)
- [ ] Ejecutar **`supabase/migrations/007_course_redesign.sql`** (añade `cover_character`, `cover_palette`, `is_featured`, `featured_order` a `courses`). Sin esto, **guardar/crear cursos en el admin falla**.
- [ ] Confirmar que las migraciones 001–006 están aplicadas (ver `docs/03-database.md`).

## 2. Variables de entorno en Vercel (Settings → Environment Variables)
- [ ] **`NEXT_PUBLIC_SITE_URL`** = `https://<tu-dominio>` (p. ej. `https://aula-kappa-nine.vercel.app` o el dominio propio). Sin esto, sitemap, robots, Open Graph y los certificados usan `localhost`.
- [ ] **`STRIPE_SECRET_KEY`** (`sk_test_…` para pruebas, `sk_live_…` para cobrar de verdad).
- [ ] **`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`** (`pk_test_…` / `pk_live_…`).
- [ ] **`STRIPE_WEBHOOK_SECRET`** (`whsec_…`). Sin las claves de Stripe, **todo checkout falla**.
- [ ] Resto de variables: ver `docs/07-env-variables.md`.

## 3. Stripe (ver `docs/stripe-setup.md`)
- [ ] Registrar el webhook → `https://<dominio>/api/webhooks/stripe`, evento `checkout.session.completed`.
- [ ] Probar una compra de prueba (tarjeta `4242 4242 4242 4242`) de punta a punta: checkout → matrícula creada → acceso al curso.

## 4. Contenido
- [ ] Marcar **1–3 cursos como destacados** en `/admin/courses` (editar curso → "Destacar en la home"). Si no marcas ninguno, la home muestra los 3 más recientes publicados.
- [ ] Revisar que cada curso publicado tiene **portada** (imagen subida o carácter+paleta) y al menos una lección con **ID/enlace de YouTube válido**.

## 5. Dominio propio (opcional, cuando lo tengáis)
- [ ] Añadirlo en Vercel → Settings → Domains.
- [ ] Actualizar `NEXT_PUBLIC_SITE_URL` al dominio definitivo.

## 6. Verificación final
- [ ] Home idéntica con y sin sesión; `/about` redirige a `/#centro`.
- [ ] Reproductor (`/learn/...`) en modo enfoque; vídeo carga; al completar, **certificado PDF** se descarga con sello.
- [ ] Móvil: menús y panel de admin usables.

> Nota: el modo oscuro está desactivado en la v1 (diseño "papel" claro, sin toggle).
