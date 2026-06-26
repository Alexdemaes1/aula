// Extrae el ID canónico (11 caracteres) de un vídeo de YouTube a partir de
// múltiples formatos: ID pelado, ID con parámetros pegados ("ID&t=30"),
// o URL completa (watch?v=, youtu.be/, /embed/, /shorts/). Devuelve null si
// no se reconoce un ID válido.
const YT_ID_RE = /^[A-Za-z0-9_-]{11}$/

export function extractYouTubeId(input: string | null | undefined): string | null {
  if (!input) return null
  const s = input.trim()
  if (!s) return null
  if (YT_ID_RE.test(s)) return s

  // Formatos de URL
  try {
    const u = new URL(s.startsWith('http') ? s : `https://${s}`)
    const host = u.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1, 12)
      if (YT_ID_RE.test(id)) return id
    }
    if (host.endsWith('youtube.com')) {
      const v = u.searchParams.get('v')
      if (v && YT_ID_RE.test(v)) return v
      const m = u.pathname.match(/\/(?:embed|shorts|v)\/([A-Za-z0-9_-]{11})/)
      if (m) return m[1]
    }
  } catch {
    // no es una URL — seguimos con el fallback
  }

  // Fallback: primeros 11 caracteres válidos seguidos ("ID&t" → "ID")
  const lead = s.match(/[A-Za-z0-9_-]{11}/)
  if (lead && YT_ID_RE.test(lead[0])) return lead[0]
  return null
}
