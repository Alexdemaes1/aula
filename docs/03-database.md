# Base de datos

## Esquema

### `profiles`
Extiende `auth.users` de Supabase. Se crea automáticamente vía trigger al registrarse.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid PK | Misma ID que `auth.users` |
| `full_name` | text | Nombre completo (editable por el usuario) |
| `role` | enum | `admin` o `student` (por defecto `student`) |
| `created_at` | timestamptz | Fecha de registro |

### `courses`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid PK | UUID autogenerado |
| `slug` | text UNIQUE | Identificador URL (ej: `intro-javascript`) |
| `title` | text | Título del curso |
| `description` | text | Descripción larga |
| `price_cents` | integer | Precio en céntimos (0 = gratis) |
| `currency` | text | Código ISO de moneda (ej: `eur`) |
| `cover_url` | text | URL pública de portada en Supabase Storage |
| `is_published` | boolean | Si es visible en el catálogo |
| `lesson_count` | integer | Mantenido por trigger automáticamente |
| `created_at` | timestamptz | Fecha de creación |

### `lessons`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid PK | UUID autogenerado |
| `course_id` | uuid FK → courses | Curso al que pertenece |
| `title` | text | Título de la lección |
| `description` | text | Descripción opcional |
| `youtube_video_id` | text | ID del vídeo de YouTube (parte tras `v=`) |
| `position` | integer | Orden dentro del curso (único por curso) |
| `min_watch_seconds` | integer | Segundos mínimos para marcar como completada |
| `notes_pdf_path` | text | Ruta en bucket `notes` (ej: `courseId/lessonId/notes.pdf`) |
| `created_at` | timestamptz | Fecha de creación |

### `enrollments`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid PK | UUID autogenerado |
| `user_id` | uuid FK → profiles | Alumno matriculado |
| `course_id` | uuid FK → courses | Curso |
| `status` | enum | `active` o `refunded` |
| `amount_paid_cents` | integer | Importe real pagado |
| `stripe_session_id` | text UNIQUE | ID de sesión Stripe (previene duplicados) |
| `purchased_at` | timestamptz | Fecha de compra |

Restricción: `UNIQUE(user_id, course_id)` — un usuario solo puede matricularse una vez por curso.

### `lesson_progress`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid PK | UUID autogenerado |
| `user_id` | uuid FK → profiles | Alumno |
| `lesson_id` | uuid FK → lessons | Lección |
| `watched_seconds` | integer | Segundos de vídeo acumulados (con cap anti-inflado) |
| `last_position` | integer | Última posición del reproductor (segundos) |
| `completed` | boolean | Si la lección está marcada como completada |
| `updated_at` | timestamptz | Última actualización |

Restricción: `UNIQUE(user_id, lesson_id)` — upsert por este par de columnas.

---

## Triggers y funciones

### `handle_new_user()`
Se dispara al insertar en `auth.users`. Crea automáticamente un `profiles` con rol `student`.

### `prevent_role_change()`
Impide que un alumno cambie su propio rol mediante la API de Supabase (anon key). Las conexiones directas con `service_role` (o desde PostgreSQL) pueden cambiar roles sin restricción.

### `refresh_lesson_count()`
Recalcula `courses.lesson_count` automáticamente en cada INSERT/UPDATE/DELETE de `lessons`.

### `is_admin()` / `is_enrolled(p_course)`
Funciones helper usadas en las políticas RLS. Comprueban el `auth.uid()` activo.

---

## Row Level Security (RLS)

Todas las tablas tienen RLS activado. La aplicación usa `service_role` para las queries del servidor (que bypasa RLS) y siempre filtra explícitamente por `user_id` en el código.

| Tabla | Política | Descripción |
|-------|---------|-------------|
| `profiles` | SELECT | Solo tus datos o si eres admin |
| `profiles` | UPDATE | Solo tus propios datos |
| `courses` | SELECT | Publicados o si eres admin |
| `courses` | ALL | Solo admins |
| `lessons` | SELECT | Solo si eres admin o estás matriculado |
| `lessons` | ALL | Solo admins |
| `enrollments` | SELECT | Solo tus matrículas o si eres admin |
| `enrollments` | INSERT/UPDATE/DELETE | Solo vía `service_role` (webhook, checkout) |
| `lesson_progress` | SELECT | Solo tus registros o si eres admin |
| `lesson_progress` | INSERT | Solo tus datos y si estás matriculado |
| `lesson_progress` | UPDATE | Solo tus propios registros |

---

## Supabase Storage

| Bucket | Tipo | Contenido | Ruta |
|--------|------|-----------|------|
| `covers` | Público | Portadas de cursos | `{courseId}/cover.{ext}` |
| `notes` | Privado | Apuntes PDF por lección | `{courseId}/{lessonId}/notes.pdf` |

Los archivos del bucket `notes` solo son accesibles mediante **signed URLs** generadas server-side (caducan en 1 hora) previa verificación de matrícula activa.

---

## Índices

```sql
CREATE INDEX ON lessons (course_id, position);
CREATE INDEX ON enrollments (user_id);
CREATE INDEX ON lesson_progress (user_id, lesson_id);
```
