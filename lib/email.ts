// Email transaccional vía API REST de Resend (sin dependencia npm).
// No-op si faltan RESEND_API_KEY o EMAIL_FROM → la app funciona igual sin emails.

const KEY = process.env.RESEND_API_KEY
const FROM = process.env.EMAIL_FROM // p. ej. "Tian Ying Fa <hola@tudominio.com>"
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aula-kappa-nine.vercel.app'

export function isEmailEnabled(): boolean {
  return Boolean(KEY && FROM)
}

/** Envío best-effort: nunca lanza; no-op si no está configurado. */
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!KEY || !FROM || !to) return
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    })
    if (!res.ok) console.error('[email] envío fallido:', res.status, await res.text().catch(() => ''))
  } catch (e) {
    console.error('[email] error:', e)
  }
}

function layout(title: string, bodyHtml: string): string {
  return `<!doctype html><html lang="es"><body style="margin:0;background:#f7f5ef;font-family:Helvetica,Arial,sans-serif;color:#14211d">
  <div style="max-width:520px;margin:0 auto;padding:24px">
    <div style="background:#16241f;border-radius:14px;padding:26px;text-align:center">
      <div style="font-family:Georgia,serif;font-size:24px;color:#c79a45;font-weight:600">Tian Ying Fa</div>
      <div style="font-size:10px;letter-spacing:3px;color:#efe6cf;opacity:.6;text-transform:uppercase;margin-top:6px">Centro de salud natural</div>
    </div>
    <div style="background:#fff;border:1px solid rgba(20,33,29,.08);border-radius:14px;padding:28px;margin-top:14px">
      <h1 style="font-family:Georgia,serif;font-size:22px;margin:0 0 14px;color:#14211d">${title}</h1>
      ${bodyHtml}
    </div>
    <p style="text-align:center;font-size:11px;color:#7a837d;margin-top:18px">Centro Tian Ying Fa · Algemesí, Valencia</p>
  </div></body></html>`
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#1f3d34;color:#efe6cf;text-decoration:none;padding:12px 22px;border-radius:9px;font-weight:600;font-size:14px">${label}</a>`
}

const P = 'font-size:14px;line-height:1.7;color:#5b655f;margin:0'

export function welcomeEmail(name: string) {
  return {
    subject: 'Bienvenido/a a Tian Ying Fa',
    html: layout(`Hola, ${name || 'bienvenido/a'}`, `
      <p style="${P}">Gracias por unirte a Tian Ying Fa. Ya puedes explorar los cursos del Sifu Salvador Montiel y empezar tu camino hacia el equilibrio.</p>
      <p style="margin:18px 0 0">${button(`${SITE}/cursos`, 'Ver cursos')}</p>`),
  }
}

export function purchaseEmail(courseTitle: string, slug: string) {
  return {
    subject: `Compra confirmada: ${courseTitle}`,
    html: layout('¡Compra confirmada!', `
      <p style="${P}">Tu acceso a <b style="color:#14211d">${courseTitle}</b> ya está activo. Tienes acceso de por vida; empieza cuando quieras.</p>
      <p style="margin:18px 0 0">${button(`${SITE}/learn/${slug}`, 'Ir al curso')}</p>`),
  }
}

export function completionEmail(courseTitle: string, slug: string) {
  return {
    subject: `¡Has completado ${courseTitle}!`,
    html: layout('¡Enhorabuena!', `
      <p style="${P}">Has completado <b style="color:#14211d">${courseTitle}</b>. Descarga tu certificado con el sello del centro y compártelo.</p>
      <p style="margin:18px 0 0">${button(`${SITE}/learn/${slug}/certificate`, 'Descargar certificado')}</p>`),
  }
}
