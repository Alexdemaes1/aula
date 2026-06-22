# Referencia de API

Todos los endpoints requieren autenticación mediante la cookie de sesión de Supabase (`sb-<ref>-auth-token`).

---

## POST `/api/checkout`

Inicia el proceso de compra de un curso.

**Auth requerida:** Sí (cualquier usuario)

**Body (JSON):**
```json
{ "courseId": "uuid" }
```

**Respuestas:**

| Status | Body | Descripción |
|--------|------|-------------|
| 200 | `{ "url": "/courses/slug?compra=ok" }` | Curso gratuito: matrícula directa |
| 200 | `{ "url": "https://checkout.stripe.com/..." }` | Curso de pago: URL de Stripe |
| 400 | `{ "error": "Ya tienes acceso a este curso" }` | Ya matriculado |
| 400 | `{ "error": "Datos inválidos" }` | UUID inválido |
| 401 | `{ "error": "No autenticado" }` | Sin sesión |
| 404 | `{ "error": "Curso no encontrado" }` | Curso no publicado o inexistente |
| 500 | `{ "error": "Error interno" }` | Error de Stripe |

---

## POST `/api/progress`

Registra progreso de visionado de una lección. Llamado automáticamente por el reproductor cada 5 segundos y al finalizar el vídeo.

**Auth requerida:** Sí (usuario matriculado en el curso de la lección)

**Body (JSON):**
```json
{
  "lessonId": "uuid",
  "deltaSeconds": 5,
  "position": 42,
  "reachedEnd": false
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `lessonId` | uuid | ID de la lección |
| `deltaSeconds` | int (0-10) | Segundos vistos desde el último tick |
| `position` | int (≥0) | Posición actual del reproductor en segundos |
| `reachedEnd` | boolean | `true` solo cuando el vídeo llega al final |

**Respuestas:**

| Status | Body | Descripción |
|--------|------|-------------|
| 200 | `{ "watchedSeconds": 30, "completed": true }` | Progreso guardado |
| 400 | `{ "error": "Datos inválidos" }` | Validación Zod fallida |
| 401 | `{ "error": "No autenticado" }` | Sin sesión |
| 403 | `{ "error": "Sin acceso" }` | No matriculado |
| 404 | `{ "error": "Lección no encontrada" }` | Lección inexistente |

**Lógica de completado:**
```
completed = yaCompletada || (segundosTotales >= min_watch_seconds && reachedEnd)
```
El cap anti-inflado limita `deltaSeconds` a 6 segundos por tick independientemente del valor enviado.

---

## POST `/api/webhooks/stripe`

Endpoint para eventos de Stripe. Solo debe ser llamado por Stripe (verificación de firma HMAC).

**Auth requerida:** Firma `stripe-signature` en headers

**Evento procesado:** `checkout.session.completed`

Cuando Stripe confirma el pago, inserta la matrícula usando `stripe_session_id` como clave de idempotencia (UNIQUE constraint previene matrículas duplicadas por reintentos del webhook).

---

## GET `/auth/callback`

Intercambia el código de autorización de Supabase por una sesión. Llamado automáticamente tras confirmar email o usar magic link.

**Parámetros de query:**

| Param | Descripción |
|-------|-------------|
| `code` | Código de autorización de Supabase |
| `next` | Ruta a la que redirigir tras autenticarse (debe empezar por `/`) |

Redirige a `/login?error=link_caducado` si el código es inválido.

---

## Server Actions

Las Server Actions no son endpoints REST estándar; se llaman desde formularios y Client Components mediante el mecanismo de Next.js.

| Acción | Archivo | Descripción |
|--------|---------|-------------|
| `loginAction` | `actions/auth.ts` | Login con email/contraseña |
| `registerAction` | `actions/auth.ts` | Registro de nuevo usuario |
| `forgotPasswordAction` | `actions/auth.ts` | Envía email de recuperación |
| `resetPasswordAction` | `actions/auth.ts` | Cambia la contraseña (requiere sesión de magic-link) |
| `logoutAction` | `actions/auth.ts` | Cierra sesión y redirige a `/login` |
| `updateProfileAction` | `actions/profile.ts` | Actualiza nombre completo del usuario |
| `createCourseAction` | `actions/admin.ts` | Crea un nuevo curso (admin) |
| `updateCourseAction` | `actions/admin.ts` | Actualiza datos de un curso (admin) |
| `deleteCourseAction` | `actions/admin.ts` | Elimina curso + storage (admin) |
| `uploadCoverAction` | `actions/admin.ts` | Sube portada al bucket covers (admin) |
| `createLessonAction` | `actions/admin.ts` | Crea una lección (admin) |
| `updateLessonAction` | `actions/admin.ts` | Actualiza una lección (admin) |
| `deleteLessonAction` | `actions/admin.ts` | Elimina lección + PDF (admin) |
| `uploadNotesAction` | `actions/admin.ts` | Sube PDF de apuntes (admin) |
| `removeNotesAction` | `actions/admin.ts` | Elimina PDF de apuntes (admin) |
| `updateUserRoleAction` | `actions/admin.ts` | Cambia rol de usuario (admin) |
| `getSignedNotesUrl` | `actions/notes.ts` | Genera URL firmada del PDF (usuario matriculado) |
