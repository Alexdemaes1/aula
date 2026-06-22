# Guía del administrador

## Acceso al panel de administración

URL: `/admin`

Solo usuarios con rol `admin` pueden acceder. El primer admin debe asignarse manualmente desde Supabase:

```sql
-- En Supabase SQL Editor
UPDATE profiles SET role = 'admin' WHERE id = 'UUID_DEL_USUARIO';
```

O desde el panel `/admin/users` si ya tienes acceso como admin.

---

## Crear un curso

1. Ve a **Cursos → Nuevo curso**
2. Rellena:
   - **Título**: nombre del curso (mínimo 3 caracteres)
   - **Slug**: se genera automáticamente desde el título; puede editarse manualmente (solo letras minúsculas, números y guiones)
   - **Descripción**: texto libre
   - **Precio**: en euros. Introduce `0` para curso gratuito
   - **Publicado**: desmarcado = borrador (no visible en catálogo)
3. Haz clic en **Crear**

El curso se crea como borrador. No aparece en el catálogo hasta que lo publiques.

---

## Añadir lecciones

Desde la edición de un curso → pestaña **Lecciones**:

1. Haz clic en **Nueva lección**
2. Rellena:
   - **Título**
   - **ID de vídeo YouTube**: la parte de la URL tras `v=`. Ejemplo: en `youtube.com/watch?v=dQw4w9WgXcQ`, el ID es `dQw4w9WgXcQ`
   - **Posición**: orden dentro del curso (1, 2, 3...)
   - **Tiempo mínimo (min)**: minutos que el alumno debe ver antes de que la lección se marque como completada. Introduce `0` para que complete al llegar al final del vídeo
   - **Descripción** (opcional)
3. Haz clic en **Crear lección**

Para **editar** una lección existente: haz clic sobre ella para expandirla y editar en el mismo lugar.

---

## Subir apuntes PDF

Desde la edición de la lección (expandida):

1. En la sección **Apuntes (PDF)**, haz clic en el campo de archivo
2. Selecciona un archivo PDF (máximo 20 MB)
3. La subida es automática al seleccionar el archivo

Para **eliminar** los apuntes: haz clic en **Quitar** junto al indicador de apuntes.

---

## Subir portada del curso

Desde la edición de un curso → pestaña **Portada**:

1. Selecciona una imagen JPG, PNG o WebP (máximo 5 MB)
2. Haz clic en **Subir portada**

La portada se muestra en el catálogo y en la página de detalle del curso.

---

## Publicar un curso

Desde la edición del curso → pestaña **Detalles**:

- Activa el toggle **Publicado** y guarda
- El curso aparece inmediatamente en el catálogo público

---

## Eliminar un curso

Desde la edición del curso:

1. Haz clic en el botón rojo **Eliminar curso** (esquina superior derecha)
2. Confirma en el diálogo

Esto elimina permanentemente:
- El curso y todos sus datos
- Todas las lecciones
- La portada en Storage
- Los PDFs de apuntes en Storage
- Todas las matrículas y el progreso de los alumnos

⚠️ Esta acción es irreversible.

---

## Gestionar usuarios

En **/admin/users**:

- Ver todos los usuarios registrados con su email, nombre y rol
- Cambiar rol entre `admin` y `student` con el botón de la fila
- No puedes cambiar tu propio rol

---

## Consultar compras

En **/admin/purchases**:

- Historial completo de matrículas
- Alumno, curso, importe pagado, estado (Activa / Reembolsada) y fecha
- Total de ingresos acumulados en la cabecera

---

## Preguntas frecuentes

**¿Cómo enrolo manualmente a un alumno en un curso?**
Desde Supabase SQL Editor:
```sql
INSERT INTO enrollments (user_id, course_id, status, amount_paid_cents)
VALUES ('UUID_USUARIO', 'UUID_CURSO', 'active', 0);
```

**¿Cómo proceso un reembolso?**
En Stripe Dashboard → busca el pago → Refund. Luego actualiza el estado en Supabase:
```sql
UPDATE enrollments SET status = 'refunded' WHERE stripe_session_id = 'cs_live_...';
```

**¿Puedo tener un alumno que también sea admin?**
Sí. El rol `admin` da acceso completo al panel y también al dashboard de alumno. El admin ve todos los cursos sin necesidad de matricularse.

**¿Cómo cambio el precio de un curso ya publicado?**
Edítalo normalmente. El nuevo precio aplica solo a las compras futuras; las matrículas existentes no cambian.
