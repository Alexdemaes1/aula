// Envía notificaciones push vía ntfy. No bloquea ni lanza errores.
const NTFY_URL = process.env.NTFY_URL

type Priority = 1 | 2 | 3 | 4 | 5

interface NotifyOptions {
  priority?: Priority
  tags?: string[]
}

export async function notify(title: string, message: string, opts: NotifyOptions = {}) {
  if (!NTFY_URL) return

  const headers: Record<string, string> = {
    Title: title,
    Priority: String(opts.priority ?? 3),
  }
  if (opts.tags?.length) headers.Tags = opts.tags.join(',')

  try {
    await fetch(NTFY_URL, { method: 'POST', headers, body: message })
  } catch {
    // silencioso — las notificaciones nunca deben afectar al flujo principal
  }
}
