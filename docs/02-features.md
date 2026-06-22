# Funcionalidades de la plataforma

## Para alumnos

### Autenticación
- **Registro** con nombre, email y contraseña → email de confirmación
- **Login** con email y contraseña, redirige a la página solicitada tras autenticarse (`?next=`)
- **Recuperar contraseña** → enlace por email → formulario de nueva contraseña con confirmación
- **Cerrar sesión** desde cualquier página autenticada
- Redirección automática: si ya tienes sesión abierta y vas a `/login`, te lleva al dashboard

### Catálogo
- Listado de todos los cursos publicados con portada, título, precio y número de lecciones
- **Búsqueda en tiempo real** por título (filtra server-side, URL compartible con `?q=término`)
- Skeleton de carga mientras llegan los datos

### Detalle de curso
- Portada, descripción completa, número de lecciones y precio
- Metadatos Open Graph (imagen para compartir en redes sociales)
- Listado de lecciones (solo visible si estás matriculado)
- Panel lateral sticky con CTA de compra o acceso directo
- Banner de confirmación tras pago exitoso

### Compra / matrícula
- Cursos **gratuitos**: matrícula instantánea sin pasar por Stripe
- Cursos de **pago**: redirige a Stripe Checkout; la matrícula se activa al recibir el webhook
- Un mismo usuario no puede comprar el mismo curso dos veces

### Reproductor y aprendizaje
- Reproductor YouTube embedido (sin sugerencias relacionadas, branding reducido)
- Barra de progreso de tiempo visto con cuenta regresiva ("Faltan Xm Ys para completar")
- Lección completada cuando se alcanza el tiempo mínimo requerido **y** el vídeo llega al final
- Link automático "Siguiente lección →" al completar
- Sidebar con todas las lecciones, indicadores de completado / bloqueado / en curso
- **Desbloqueo secuencial**: solo puedes ir a la siguiente lección si completaste la anterior
- Apuntes descargables en PDF por lección (URL firmada privada, caduca en 1 hora)
- Barra de progreso del curso en el sidebar (X/N lecciones completadas)
- Banner "¡Curso completado!" al finalizar todas las lecciones

### Dashboard
- Tarjetas con todos tus cursos adquiridos
- Estado de cada curso: Sin empezar / En progreso / Completado
- Barra de progreso por curso (lecciones completadas / total)
- Botón contextual: Empezar / Continuar / Repasar
- Estado vacío con CTA al catálogo

### Cuenta
- Editar nombre completo
- Email visible (no editable desde la app; gestión en Supabase)

---

## Para administradores

Los admins tienen acceso completo sin restricciones de matrícula y ven todas las rutas de `/admin`.

### Panel de estadísticas (`/admin`)
- Total de cursos, usuarios, matrículas activas e ingresos
- Feed de las 5 últimas compras con nombre del alumno, curso, importe y fecha

### Gestión de cursos (`/admin/courses`)
- Listado de todos los cursos (publicados y borradores) con estado y número de lecciones
- **Crear curso**: título, slug (auto-generado o manual), descripción, precio y moneda
- **Editar curso**: mismos campos + toggle de publicación
- **Eliminar curso** con diálogo de confirmación: borra curso, lecciones, portada en Storage y PDFs de apuntes
- **Subir portada**: imagen JPG/PNG/WebP hasta 5 MB, reemplaza la anterior
- Navegación por pestañas: Detalles / Lecciones / Portada

### Gestión de lecciones
- Añadir lección: título, ID de vídeo YouTube, posición, tiempo mínimo de visionado (minutos), descripción
- Editar lección (expansión in situ)
- Eliminar lección (con limpieza de apuntes en Storage)
- Subir apuntes PDF por lección (hasta 20 MB)
- Quitar apuntes PDF

### Gestión de usuarios (`/admin/users`)
- Listado con nombre, email, rol y fecha de registro
- Cambiar rol entre `admin` y `student` (excepto sobre uno mismo)

### Gestión de compras (`/admin/purchases`)
- Historial completo de matrículas con alumno, curso, importe, estado y fecha
- Estado: Activa / Reembolsada
- Total de ingresos acumulados

---

## Seguridad y calidad

- TypeScript estricto en todo el proyecto (0 errores)
- Validación con Zod en todos los endpoints y server actions
- RLS de Supabase activado en todas las tablas
- Firma HMAC verificada en cada webhook de Stripe
- Rutas protegidas por `proxy.ts` (edge) + `requireUser/requireAdmin` (server)
- Signed URLs privadas para PDFs (1 hora de validez)
- Security headers HTTP en todas las respuestas
- Sin `dangerouslySetInnerHTML` en ningún componente
- Subidas de archivos validadas por tipo MIME y tamaño

---

## Limitaciones actuales (conocidas)

| Limitación | Motivo | Solución futura |
|-----------|--------|----------------|
| Solo vídeos de YouTube | Decisión de diseño | Añadir soporte Vimeo/upload propio |
| Sin sistema de valoraciones/comentarios | Fuera de alcance inicial | Tabla `reviews` |
| Sin certificado de finalización | Fuera de alcance inicial | PDF generado con `@react-pdf/renderer` |
| Sin notificaciones por email en compras | No configurado | Función serverless de Supabase |
| Sin búsqueda por instructor/categoría | Fuera de alcance | Añadir campos y filtros |
| Sin reembolsos desde la UI | Requiere Stripe Portal | Añadir Server Action de reembolso |
| Sin paginación en tablas de admin | Volumen pequeño actual | Añadir cursor pagination |
| Sin rate limiting propio en login | Supabase lo gestiona internamente | Añadir limitación propia si escala |
