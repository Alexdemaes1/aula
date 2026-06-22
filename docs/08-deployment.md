# Despliegue: GitHub + Vercel

## Requisitos previos

- Cuenta en [GitHub](https://github.com)
- Cuenta en [Vercel](https://vercel.com) (plan Hobby = gratis, sin tarjeta)
- Git instalado localmente

---

## 1. Subir a GitHub

### Primera vez

```bash
# En la carpeta del proyecto
git init
git add .
git commit -m "Initial commit: mini-LMS"

# Crear repositorio en GitHub (puede ser privado)
# Luego conectar:
git remote add origin https://github.com/TU_USUARIO/mini-lms.git
git branch -M main
git push -u origin main
```

### Flujo de trabajo diario

```bash
git add .
git commit -m "descripción del cambio"
git push
```
Vercel detecta el push y despliega automáticamente en ~60 segundos.

---

## 2. Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com) → **Add New Project**
2. Importa el repositorio de GitHub
3. Vercel detecta Next.js automáticamente — no cambies ningún ajuste de build
4. Antes de hacer clic en **Deploy**, añade las variables de entorno (ver `docs/07-env-variables.md`)
5. Haz clic en **Deploy**

El primer despliegue tardará 2-3 minutos. Los siguientes ~60 segundos.

---

## 3. Configurar el dominio en producción

Vercel asigna automáticamente: `mini-lms-HASH.vercel.app`

Para un dominio propio:
1. Vercel → **Settings → Domains** → añade tu dominio
2. Apunta el DNS de tu dominio a los servidores de Vercel (te dan los registros exactos)

Actualiza `NEXT_PUBLIC_SITE_URL` en las variables de Vercel con el dominio definitivo.

---

## 4. Configurar el webhook de Stripe para producción

1. [dashboard.stripe.com](https://dashboard.stripe.com) → **Developers → Webhooks → Add endpoint**
2. URL: `https://TU_DOMINIO/api/webhooks/stripe`
3. Evento: `checkout.session.completed`
4. Copia el **Signing secret** y actualiza `STRIPE_WEBHOOK_SECRET` en Vercel

---

## 5. Configurar emails de Supabase en español

En Supabase → **Authentication → Email Templates** personaliza:
- **Confirm signup** (confirmación de registro)
- **Reset password** (recuperación de contraseña)

Plantillas de ejemplo:

**Confirm signup:**
```html
<h2>Confirma tu cuenta</h2>
<p>Haz clic en el enlace para activar tu cuenta en Mini-LMS:</p>
<a href="{{ .ConfirmationURL }}">Confirmar cuenta</a>
```

**Reset password:**
```html
<h2>Restablece tu contraseña</h2>
<p>Haz clic en el enlace para crear una nueva contraseña:</p>
<a href="{{ .ConfirmationURL }}">Restablecer contraseña</a>
```

---

## Desarrollar desde varios PCs

### Clonar el proyecto

```bash
git clone https://github.com/TU_USUARIO/mini-lms.git
cd mini-lms
npm install
```

### Configurar el entorno local

Crea `.env.local` con las mismas variables (no se comparte por Git, es local).
Comparte las variables de forma segura por 1Password, Bitwarden o un canal privado.

### Arrancar el servidor de desarrollo

```bash
npx next dev -p 3002
```

---

## Entornos

| Entorno | URL | Base de datos | Stripe |
|---------|-----|--------------|--------|
| Local | `http://localhost:3002` | Supabase (mismo proyecto) | — (sin pagos) |
| Preview (Vercel) | `mini-lms-git-branch.vercel.app` | Supabase (mismo proyecto) | Stripe Test |
| Producción | `tu-dominio.com` | Supabase (mismo proyecto) | Stripe Live |

> Todos los entornos usan el mismo proyecto de Supabase. Si quieres aislar los datos de prueba, crea un segundo proyecto en Supabase solo para desarrollo/preview.

---

## CI/CD automático

Vercel crea una Preview URL por cada pull request o push a rama distinta de `main`. Esto te permite revisar cambios antes de hacer merge a producción.

```
push a 'feature/nueva-funcion'  →  Preview URL automática
merge a 'main'                  →  Despliegue a producción
```
