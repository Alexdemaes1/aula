// Metadatos compartidos de curso (disciplina, nivel, duración).
// Reutilizado por admin, catálogo, tarjetas y detalle.

export const CATEGORIES = [
  { value: 'taiji', label: 'Tai Ji Quan' },
  { value: 'qigong', label: 'Qi Gong' },
  { value: 'meditacion', label: 'Meditación' },
  { value: 'kungfu', label: 'Kung Fu' },
  { value: 'medicina', label: 'Medicina natural' },
  { value: 'otro', label: 'Otro' },
] as const

export const LEVELS = [
  { value: 'principiante', label: 'Principiante' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'avanzado', label: 'Avanzado' },
] as const

export function categoryLabel(value?: string | null): string | null {
  return CATEGORIES.find((c) => c.value === value)?.label ?? null
}

export function levelLabel(value?: string | null): string | null {
  return LEVELS.find((l) => l.value === value)?.label ?? null
}

export function formatDuration(minutes?: number | null): string | null {
  if (!minutes || minutes <= 0) return null
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0) return m > 0 ? `${h} h ${m} min` : `${h} h`
  return `${m} min`
}

/** Divide los objetivos (texto por líneas) en una lista limpia. */
export function parseObjectives(text?: string | null): string[] {
  if (!text) return []
  return text
    .split('\n')
    .map((s) => s.replace(/^[-*•\s]+/, '').trim())
    .filter(Boolean)
}
