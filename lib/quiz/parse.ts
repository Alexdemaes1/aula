import { z } from 'zod'
import type { QuizQuestionType } from '@/types'

/**
 * Parser robusto de preguntas generadas por una IA externa.
 * Formato esperado (tolerante a ruido): bloques separados por "---", cada uno:
 *   P: <enunciado>
 *   A) opción   ·   *B) opción correcta   ·   ...
 *   E: <explicación opcional>
 *
 * Tolera: fences markdown (```), prosa de la IA antes/después, comillas
 * tipográficas, viñetas, numeración, variantes A. / A- / minúsculas.
 * Recuperación parcial: importa las válidas y reporta las fallidas.
 */

export interface ParsedOption {
  label: string
  isCorrect: boolean
}

export interface ParsedQuestion {
  prompt: string
  type: QuizQuestionType
  options: ParsedOption[]
  explanation?: string
}

export interface ParseIssue {
  block: number
  preview: string
  message: string
}

export interface ParseResult {
  questions: ParsedQuestion[]
  errors: ParseIssue[]
}

const optionSchema = z.object({
  label: z.string().trim().min(1, 'Hay una opción vacía'),
  isCorrect: z.boolean(),
})

const questionSchema = z.object({
  prompt: z.string().trim().min(5, 'El enunciado es demasiado corto'),
  options: z.array(optionSchema).min(2, 'Se requieren al menos 2 opciones').max(6, 'Máximo 6 opciones'),
})

function normalize(raw: string): string {
  let s = raw.replace(/\r\n?/g, '\n')
  // Quitar fences de markdown ```...``` (con o sin lenguaje)
  s = s.replace(/```[a-zA-Z]*\n?/g, '').replace(/```/g, '')
  // Comillas tipográficas → rectas
  s = s.replace(/[“”«»]/g, '"').replace(/[‘’]/g, "'")
  // Viñetas markdown al inicio de una opción ("- A)" → "A)")
  s = s.replace(/^[ \t]*[-*•][ \t]+(?=\*?\s*[A-Fa-f][).\-])/gm, '')
  return s
}

function splitBlocks(s: string): string[] {
  if (/^\s*-{3,}\s*$/m.test(s)) return s.split(/^\s*-{3,}\s*$/m)
  return s.split(/\n\s*\n+/)
}

const PROMPT_RE = /^\s*(?:p|pregunta|q|question)\s*\d*\s*[:.)\-]\s*(.+)$/i
const NUMBERED_PROMPT_RE = /^\s*\d+\s*[).\-]\s*(.+)$/
const OPTION_RE = /^\s*(\*?)\s*([A-Fa-f])\s*[).\-]\s*(.+)$/
const EXPL_RE = /^\s*(?:e|explicaci[oó]n)\s*[:.)\-]\s*(.+)$/i

function inferType(options: ParsedOption[]): QuizQuestionType {
  const correctCount = options.filter(o => o.isCorrect).length
  if (correctCount > 1) return 'multiple'
  if (
    options.length === 2 &&
    options.every(o => /^(verdadero|falso|true|false|v|f)$/i.test(o.label.trim()))
  ) {
    return 'boolean'
  }
  return 'single'
}

function parseBlock(block: string, index: number): { q?: ParsedQuestion; err?: ParseIssue } {
  const lines = block.split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length === 0) return {}

  let prompt = ''
  const options: ParsedOption[] = []
  let explanation: string | undefined

  for (const line of lines) {
    const opt = OPTION_RE.exec(line)
    if (opt && (prompt || options.length)) {
      options.push({ isCorrect: opt[1] === '*', label: opt[3].trim() })
      continue
    }
    const expl = EXPL_RE.exec(line)
    if (expl) {
      explanation = expl[1].trim()
      continue
    }
    if (!prompt) {
      const pm = PROMPT_RE.exec(line) ?? NUMBERED_PROMPT_RE.exec(line)
      prompt = (pm ? pm[1] : line).trim()
      continue
    }
    // Línea suelta tras el enunciado, antes de las opciones → continuación
    if (prompt && options.length === 0) prompt += ' ' + line
  }

  const preview = prompt.slice(0, 50) || '(sin enunciado)'
  const correctCount = options.filter(o => o.isCorrect).length

  if (options.length < 2) {
    return { err: { block: index, preview, message: `Se encontraron ${options.length} opciones; se requieren al menos 2.` } }
  }
  if (options.length > 6) {
    return { err: { block: index, preview, message: `Se encontraron ${options.length} opciones; el máximo es 6.` } }
  }
  if (correctCount === 0) {
    return { err: { block: index, preview, message: 'No se marcó ninguna opción correcta con *.' } }
  }

  const parsed = questionSchema.safeParse({ prompt, options })
  if (!parsed.success) {
    return { err: { block: index, preview, message: parsed.error.issues[0].message } }
  }

  return {
    q: {
      prompt: parsed.data.prompt,
      type: inferType(parsed.data.options),
      options: parsed.data.options,
      explanation,
    },
  }
}

export function parseQuestions(raw: string): ParseResult {
  const questions: ParsedQuestion[] = []
  const errors: ParseIssue[] = []

  if (!raw || !raw.trim()) {
    return { questions, errors: [{ block: 0, preview: '', message: 'No se pegó ningún contenido.' }] }
  }

  const blocks = splitBlocks(normalize(raw))
  let idx = 0
  for (const block of blocks) {
    // Descartar bloques sin marcadores de pregunta/opción (prosa de la IA)
    if (
      !/^\s*(?:p|pregunta|q|question)\b/im.test(block) &&
      !/^\s*\*?\s*[A-Fa-f]\s*[).\-]/m.test(block) &&
      !/^\s*\d+\s*[).\-]/m.test(block)
    ) {
      continue
    }
    idx += 1
    const { q, err } = parseBlock(block, idx)
    if (q) questions.push(q)
    else if (err) errors.push(err)
  }

  if (questions.length === 0 && errors.length === 0) {
    errors.push({ block: 0, preview: '', message: 'No se reconoció ninguna pregunta en el texto pegado.' })
  }

  return { questions, errors }
}
