# Auditoría de seguridad

## Resumen

| Área | Estado | Notas |
|------|--------|-------|
| Exposición de secretos | ✅ Seguro | Ninguna clave secreta en cliente ni en `NEXT_PUBLIC_*` |
| XSS | ✅ Seguro | React escapa JSX; sin `dangerouslySetInnerHTML` |
| Inyección SQL | ✅ Seguro | Solo ORM de Supabase; sin queries raw de usuario |
| CSRF | ✅ Seguro | Next.js Server Actions tienen protección CSRF incorporada |
| Autenticación | ✅ Seguro | `requireUser/requireAdmin` en todas las rutas protegidas |
| Autorización de datos | ✅ Seguro | Filtro explícito por `user_id` en todas las queries |
| Webhook Stripe | ✅ Seguro | Firma HMAC verificada antes de procesar |
| Subida de archivos | ✅ Seguro | Validación de tipo MIME y tamaño |
| Open redirect | ✅ Seguro | Parámetro `next` validado (debe empezar por `/`, no `//`) |
| URLs firmadas | ✅ Seguro | PDFs privados con signed URLs de 1 hora |
| Security headers | ✅ Seguro | X-Frame-Options, X-Content-Type-Options, Referrer-Policy |
| Rate limiting | ⚠️ Supabase | El login está limitado por Supabase (no por la app) |
| CSP completo | ⚠️ Sin implementar | Requiere nonces en layouts; mejora futura |

---

## Gestión de secretos

Las siguientes variables **nunca** son accesibles desde el cliente (no tienen prefijo `NEXT_PUBLIC_`):

- `STRIPE_SECRET_KEY` — clave secreta de Stripe
- `STRIPE_WEBHOOK_SECRET` — secreto para verificar firmas de webhook
- `SUPABASE_SERVICE_ROLE_KEY` — bypasa RLS; solo para el servidor

Las variables accesibles desde el cliente son inofensivas:

- `NEXT_PUBLIC_SUPABASE_URL` — URL pública de Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — clave pública (respeta RLS)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — clave pública de Stripe
- `NEXT_PUBLIC_SITE_URL` — URL del sitio para redirecciones auth

---

## Capas de autorización

La protección es **multicapa** (defensa en profundidad):

```
1. proxy.ts (edge)          → Redirige a /login sin sesión
2. requireUser/requireAdmin  → Redirige si rol insuficiente
3. Queries con user_id       → Solo datos propios, aunque service_role bypase RLS
4. RLS de Supabase           → Protección adicional si alguien usa anon key directamente
5. Trigger prevent_role_change → Impide cambio de rol propio vía API pública
```

---

## Enrollments: protección contra fraude

- La matrícula en cursos de pago **solo** ocurre vía webhook de Stripe con firma HMAC verificada
- El campo `stripe_session_id` tiene restricción `UNIQUE` → los reintentos del webhook no crean matrículas duplicadas
- La API de checkout verifica que el usuario no esté ya matriculado antes de crear la sesión
- El progreso solo se registra si hay matrícula activa (verificado server-side en `/api/progress`)

---

## Subida de archivos

| Tipo | Validaciones |
|------|-------------|
| Portadas (imágenes) | MIME debe empezar por `image/`, máximo 5 MB |
| Apuntes (PDF) | MIME debe ser exactamente `application/pdf`, máximo 20 MB |

Los archivos se suben con el `contentType` explícito, no el detectado por el navegador.

---

## Security headers (en todas las respuestas)

| Header | Valor | Protección |
|--------|-------|-----------|
| `X-Content-Type-Options` | `nosniff` | Evita MIME sniffing |
| `X-Frame-Options` | `DENY` | Previene clickjacking |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limita referrer info |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Deshabilita APIs de dispositivo |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Fuerza HTTPS (HSTS) |

---

## Puntos a mejorar en producción

### 1. Content Security Policy (CSP) estricto
Implementar CSP con nonces (documentado en Next.js 16) para proteger contra XSS de terceros. Requiere:
- Añadir nonce en `proxy.ts`
- Pasar nonce al `<script>` del YouTube iframe API
- Configurar: `script-src 'self' 'nonce-{nonce}'`, `frame-src https://www.youtube.com`

### 2. Rate limiting propio
Aunque Supabase limita intentos de login, añadir rate limiting en `/api/checkout` y `/api/progress` con Upstash Redis o similar.

### 3. Alertas de seguridad
Configurar alertas en Supabase para actividad anómala (muchos intentos de login fallidos, muchas matrículas en poco tiempo).

### 4. Rotación de claves
Establecer un proceso de rotación periódica de `STRIPE_WEBHOOK_SECRET` y `SUPABASE_SERVICE_ROLE_KEY`.

### 5. Auditoría de logs
Activar Supabase Logs y conectar con herramienta de monitorización (Axiom, Datadog, etc.) para detectar accesos sospechosos.
