'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClipboardCopy, Sparkles, Check, AlertTriangle } from 'lucide-react'
import { buildAiExportText } from '@/lib/quiz/export'
import { parseQuestions, type ParseResult } from '@/lib/quiz/parse'
import { importQuizQuestionsAction } from '@/app/actions/admin'
import type { Course, Lesson } from '@/types'
import { toast } from 'sonner'

interface QuizAiExchangeProps {
  courseId: string
  course: Pick<Course, 'title' | 'description'>
  lessons: Pick<Lesson, 'title' | 'description' | 'content_type' | 'body' | 'position'>[]
  hasExistingQuestions: boolean
}

const TYPE_LABEL: Record<string, string> = { single: 'Única', multiple: 'Múltiple', boolean: 'V/F' }

export function QuizAiExchange({ courseId, course, lessons, hasExistingQuestions }: QuizAiExchangeProps) {
  const [count, setCount] = useState(10)
  const [raw, setRaw] = useState('')
  const [preview, setPreview] = useState<ParseResult | null>(null)
  const [replace, setReplace] = useState(false)
  const [pending, startTransition] = useTransition()

  async function handleCopy() {
    const text = buildAiExportText(course, lessons, count)
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Contenido copiado. Pégalo en ChatGPT o Claude y pide las preguntas.')
    } catch {
      toast.error('No se pudo copiar al portapapeles')
    }
  }

  function handlePreview() {
    setPreview(parseQuestions(raw))
  }

  function handleImport() {
    startTransition(async () => {
      const result = await importQuizQuestionsAction(courseId, raw, replace)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(`${result.imported} pregunta(s) importada(s)`)
      if (result.errors.length > 0) {
        toast.warning(`${result.errors.length} bloque(s) se omitieron`)
      }
      setRaw('')
      setPreview(null)
    })
  }

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          Generar preguntas con IA externa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Paso 1 — copiar contenido */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            1. Copia el contenido del curso y pégalo en ChatGPT o Claude. Generará las preguntas en el formato correcto.
          </p>
          <div className="flex items-end gap-2">
            <div className="space-y-1">
              <Label htmlFor="q-count" className="text-xs">Nº de preguntas</Label>
              <Input
                id="q-count"
                type="number"
                min={1}
                max={50}
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                className="w-24"
              />
            </div>
            <Button type="button" variant="outline" onClick={handleCopy}>
              <ClipboardCopy className="size-4 mr-1.5" />
              Copiar contenido para IA
            </Button>
          </div>
        </div>

        {/* Paso 2 — pegar e importar */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            2. Pega aquí la respuesta de la IA y previsualiza antes de importar.
          </p>
          <Textarea
            value={raw}
            onChange={(e) => {
              setRaw(e.target.value)
              setPreview(null)
            }}
            rows={8}
            placeholder={'P: ¿...?\nA) ...\n*B) ...\nC) ...\nD) ...\n---'}
            className="font-mono text-xs"
          />
          <div className="flex items-center gap-2 flex-wrap">
            <Button type="button" variant="secondary" size="sm" onClick={handlePreview} disabled={!raw.trim()}>
              Previsualizar
            </Button>
            {hasExistingQuestions && (
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <input type="checkbox" checked={replace} onChange={(e) => setReplace(e.target.checked)} className="accent-primary" />
                Reemplazar las preguntas existentes
              </label>
            )}
            <Button
              type="button"
              size="sm"
              onClick={handleImport}
              disabled={pending || !preview || preview.questions.length === 0}
            >
              {pending ? 'Importando…' : `Importar ${preview?.questions.length ?? 0} pregunta(s)`}
            </Button>
          </div>
        </div>

        {/* Resultado de la previsualización */}
        {preview && (
          <div className="space-y-3">
            {preview.questions.length > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-primary">
                <Check className="size-4" /> {preview.questions.length} pregunta(s) reconocida(s)
              </div>
            )}
            {preview.errors.length > 0 && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-sm font-medium text-destructive">
                  <AlertTriangle className="size-4" /> {preview.errors.length} bloque(s) no se pudieron importar
                </div>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {preview.errors.map((e, i) => (
                    <li key={i}>
                      {e.block > 0 && <span className="font-medium">Bloque {e.block}</span>}
                      {e.preview && <span> — “{e.preview}”</span>}: {e.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {preview.questions.length > 0 && (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {preview.questions.map((q, i) => (
                  <div key={i} className="rounded-md border p-3 text-sm space-y-1">
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="text-[10px] shrink-0">{TYPE_LABEL[q.type]}</Badge>
                      <span className="font-medium">{q.prompt}</span>
                    </div>
                    <ul className="pl-1 space-y-0.5">
                      {q.options.map((o, j) => (
                        <li key={j} className={o.isCorrect ? 'text-primary' : 'text-muted-foreground'}>
                          {o.isCorrect ? '✓ ' : '· '}
                          {o.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
