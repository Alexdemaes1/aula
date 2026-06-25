import type { Course, Lesson } from '@/types'

/**
 * Serialización del contenido del curso para pegar en una IA externa
 * (ChatGPT/Claude) que genere preguntas tipo test. Funciones puras → se
 * ejecutan en el cliente (el botón "Copiar" no necesita server action).
 */

export const PROMPT_TEMPLATE = `Eres un generador de cuestionarios tipo test para una plataforma de formación.
A partir del CONTENIDO DEL CURSO que aparece más abajo, redacta exactamente {N}
preguntas de opción múltiple en ESPAÑOL.

REGLAS OBLIGATORIAS DE FORMATO. Devuelve ÚNICAMENTE las preguntas, sin ningún
texto introductorio, sin conclusiones, sin numeración, sin Markdown y sin
bloques de código. Sigue EXACTAMENTE esta plantilla para cada pregunta:

P: <enunciado de la pregunta>
A) <opción 1>
B) <opción 2>
C) <opción 3>
D) <opción 4>
E: <explicación breve de por qué la respuesta correcta es correcta>

Separa cada pregunta de la siguiente con una línea que contenga solo tres guiones:
---

Requisitos del contenido:
- Entre 2 y 6 opciones por pregunta (normalmente 4: A, B, C, D).
- Marca la opción correcta anteponiendo un asterisco a su letra, por ejemplo:
  *C) Texto de la opción correcta
- Si la pregunta admite VARIAS respuestas correctas, marca con asterisco TODAS
  las correctas. Si es de Verdadero/Falso, usa exactamente dos opciones
  "Verdadero" y "Falso" y marca la correcta.
- Las preguntas deben poder responderse SOLO con el contenido del curso de abajo.
  No inventes datos que no aparezcan en el contenido.
- La línea "E:" (explicación) es opcional pero recomendable; máximo una frase.
- No uses comillas tipográficas ni viñetas; usa texto plano.
- No repitas preguntas ni opciones.

Ejemplo de UNA pregunta con el formato correcto:

P: ¿Cuál es el objetivo principal de la respiración abdominal en Qi Gong?
A) Aumentar la frecuencia cardíaca
B) Tensar la musculatura lumbar
*C) Dirigir y acumular el Qi en el Dan Tian inferior
D) Acelerar la respiración torácica
E: La respiración abdominal concentra el Qi en el Dan Tian inferior.

=== CONTENIDO DEL CURSO ===
{CONTENIDO}
=== FIN DEL CONTENIDO ===`

type ExportLesson = Pick<Lesson, 'title' | 'description' | 'content_type' | 'body' | 'position'>

/** Serializa el contenido textual del curso (sin el prompt). */
export function serializeCourseContent(
  course: Pick<Course, 'title' | 'description'>,
  lessons: ExportLesson[]
): string {
  const parts: string[] = []
  parts.push(`# CURSO: ${course.title.trim()}`)
  if (course.description?.trim()) {
    parts.push(`Descripción del curso: ${course.description.trim()}`)
  }
  parts.push('')

  const ordered = [...lessons].sort((a, b) => a.position - b.position)
  for (const l of ordered) {
    parts.push(`## Lección ${l.position}: ${l.title.trim()}`)
    if (l.description?.trim()) parts.push(l.description.trim())
    if (l.content_type === 'text') {
      const body = (l.body ?? '').trim()
      parts.push(body || '(Sin contenido de texto.)')
    } else {
      parts.push('[LECCIÓN EN VÍDEO — usa el título y la descripción como guía del contenido tratado.]')
    }
    parts.push('')
  }

  return parts.join('\n').trim()
}

/** String completo listo para el portapapeles: prompt + contenido. */
export function buildAiExportText(
  course: Pick<Course, 'title' | 'description'>,
  lessons: ExportLesson[],
  questionCount: number
): string {
  const content = serializeCourseContent(course, lessons)
  const n = Math.max(1, Math.min(100, Math.floor(questionCount) || 10))
  return PROMPT_TEMPLATE.replace('{N}', String(n)).replace('{CONTENIDO}', content)
}
