# Informe de escalabilidad

## Límites de los planes gratuitos

### Supabase (plan Free)

| Recurso | Límite | Estimación de consumo |
|---------|--------|----------------------|
| Base de datos | 500 MB | Ver tabla de proyección abajo |
| Storage | 1 GB | ~50 PDFs de 20 MB o ~200 portadas de 5 MB |
| Transferencia | 5 GB/mes | Suficiente para arrancar |
| Usuarios activos | 50.000 MAU | Muy holgado para etapa inicial |
| Funciones Edge | 500.000 invocaciones/mes | Suficiente |
| Auth emails | 3 emails/hora en free | ⚠️ Limitante para lanzamiento masivo |

### Vercel (plan Hobby — gratuito)

| Recurso | Límite | Notas |
|---------|--------|-------|
| Bandwidth | 100 GB/mes | ~100.000 visitas/mes (1 MB/visita promedio) |
| Serverless Functions | Ilimitadas (ejecución) | Sin límite de invocaciones |
| Timeout por función | 10 segundos | ⚠️ Ver sección de timeouts |
| Tamaño de bundle | 50 MB por función | Sin problema con este stack |
| Dominios personalizados | Ilimitados | ✅ |
| CI/CD por push | Ilimitado | ✅ |
| Colaboradores en Hobby | 1 (solo tú) | ⚠️ Para equipo, necesitas Pro |

> **Conclusión**: El plan Hobby de Vercel es suficiente para desarrollo, demos y usuarios iniciales. No requiere tarjeta de crédito.

---

## Proyección de base de datos

Con el esquema actual, estimación de tamaño en PostgreSQL:

| Tabla | Tamaño por fila | 100 usuarios | 1.000 usuarios | 10.000 usuarios |
|-------|----------------|--------------|----------------|-----------------|
| `profiles` | ~200 B | 20 KB | 200 KB | 2 MB |
| `courses` | ~500 B | — | — | — |
| `lessons` | ~300 B | — | — | — |
| `enrollments` | ~200 B | 2 KB/curso | 20 KB/curso | 200 KB/curso |
| `lesson_progress` | ~200 B | 20 KB | 200 KB | 2 MB |

Ejemplo realista: **1.000 alumnos × 10 cursos × 5 lecciones = 50.000 filas de progress** → ~10 MB. El límite de 500 MB aguanta hasta aproximadamente 50.000 alumnos activos con esta estructura.

---

## Riesgo de timeout en Vercel Hobby (10 s)

| Operación | Tiempo estimado | Riesgo |
|-----------|----------------|--------|
| Subir portada (5 MB) | 2-5 s | ✅ Seguro |
| Subir PDF de apuntes (20 MB) | 5-15 s | ⚠️ Posible timeout |
| Webhook Stripe | <1 s | ✅ Seguro |
| Heartbeat de progreso | <1 s | ✅ Seguro |
| Páginas con múltiples queries | 1-3 s | ✅ Seguro |

**Mitigación para uploads grandes**: en producción con tráfico real, considerar subir directamente desde el cliente al bucket de Supabase mediante presigned upload URLs, eliminando el paso por Vercel.

---

## Cuellos de botella identificados

### 1. Dashboard — N+1 de progress queries
```typescript
// dashboard/page.tsx hace Promise.all de N queries (una por curso)
const progressData = await Promise.all(courseIds.map(async (courseId) => { ... }))
```
**Impacto**: Si un alumno tiene 50 cursos → 50 queries paralelas.
**Solución a escala**: Una sola query con JOIN o agregación por `course_id`.

### 2. Admin dashboard — sin paginación
La lista de matrículas y usuarios carga todos los registros de una vez.
**Impacto**: Con >10.000 registros, respuesta lenta.
**Solución**: Cursor pagination (Supabase soporta `.range(from, to)`).

### 3. Heartbeat por alumno/lección
Cada alumno viendo un vídeo genera 1 request a `/api/progress` cada 5 segundos.
**100 alumnos simultáneos** = 1.200 requests/minuto.
**Impacto en Vercel Hobby**: Las funciones serverless son stateless; escala automáticamente.
**Impacto en Supabase**: 1.200 UPSERTs/minuto es manejable en el plan free.

### 4. Storage: cleanup en delete
Al eliminar un curso con muchas lecciones y PDFs, la acción puede ser lenta.
**Solución actual**: Aceptable para volumen de admin (pocas eliminaciones).

---

## Cuándo actualizar el plan

| Trigger | Acción |
|---------|--------|
| Equipo > 1 desarrollador | Vercel Pro ($20/mes por miembro) |
| Uploads de PDF >10 MB frecuentes | Vercel Pro (timeout 60s) o presigned URLs |
| Bandwidth > 80 GB/mes | Vercel Pro (1 TB incluido) |
| Storage > 800 MB | Supabase Pro ($25/mes, 8 GB storage) |
| >50.000 MAU | Supabase Pro |
| Emails de auth > 3/hora | Supabase Pro o SMTP propio (Resend, SendGrid) |
| Base de datos > 400 MB | Supabase Pro |

---

## Arquitectura a mayor escala (referencia)

Si el producto crece significativamente:

1. **CDN para vídeos**: En lugar de YouTube, usar Cloudflare Stream o Mux para vídeos privados con DRM.
2. **Caché de respuestas**: Añadir Redis (Upstash) para cachear datos de cursos que no cambian frecuentemente.
3. **Queue para webhooks**: En lugar de procesar Stripe webhooks síncronamente, encolarlos en Inngest o Trigger.dev.
4. **Read replicas**: Supabase Pro incluye read replicas para descargar queries de lectura pesadas.
5. **Presigned uploads**: Subida directa al Storage de Supabase desde el cliente, sin pasar por Vercel.
6. **Separación de base de datos**: Para >100k usuarios, considerar migrar a Neon o PlanetScale con mejor pool de conexiones.
