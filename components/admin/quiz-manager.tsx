'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  upsertQuizSettingsAction,
  createQuestionAction,
  updateQuestionAction,
  deleteQuestionAction,
  reorderQuestionAction,
} from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { QuizAiExchange } from '@/components/admin/quiz-ai-exchange'
import { Plus, Trash2, ChevronUp, ChevronDown, Loader2, X, CheckCircle, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Course, Lesson, Quiz, QuizQuestion, QuizQuestionType } from '@/types'
import { toast } from 'sonner'

interface QuizManagerProps {
  courseId: string
  course: Pick<Course, 'title' | 'description'>
  lessons: Pick<Lesson, 'title' | 'description' | 'content_type' | 'body' | 'position'>[]
  quiz: Quiz | null
  questions: QuizQuestion[]
}

const TYPE_OPTIONS: { value: QuizQuestionType; label: string }[] = [
  { value: 'single', label: 'Opción única' },
  { value: 'multiple', label: 'Selección múltiple' },
  { value: 'boolean', label: 'Verdadero / Falso' },
]

// ── Ajustes del cuestionario ──────────────────────────────
function QuizSettings({ courseId, quiz }: { courseId: string; quiz: Quiz | null }) {
  const [state, action, pending] = useActionState(upsertQuizSettingsAction, null)
  const [required, setRequired] = useState(quiz?.required_for_completion ?? false)
  const router = useRouter()

  useEffect(() => {
    if (state?.error) toast.error(state.error)
    if (state?.message) {
      toast.success(state.message)
      router.refresh()
    }
  }, [state, router])

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="course_id" value={courseId} />
      <div className="space-y-2">
        <Label htmlFor="quiz-title">Título del cuestionario</Label>
        <Input id="quiz-title" name="title" defaultValue={quiz?.title ?? 'Autoevaluación'} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="passing">Aprobado (% mínimo)</Label>
          <Input id="passing" name="passing_score" type="number" min={0} max={100} defaultValue={quiz?.passing_score ?? 70} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max-att">Intentos máximos</Label>
          <Input
            id="max-att"
            name="max_attempts"
            type="number"
            min={1}
            defaultValue={quiz?.max_attempts ?? ''}
            placeholder="Ilimitados"
          />
          <p className="text-xs text-muted-foreground">Vacío = ilimitados</p>
        </div>
      </div>

      <input type="hidden" name="required_for_completion" value={required ? 'on' : ''} />
      <label className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer">
        <input
          type="checkbox"
          checked={required}
          onChange={(e) => setRequired(e.target.checked)}
          className="accent-primary size-4 mt-0.5 shrink-0"
        />
        <span className="space-y-0.5">
          <span className="block text-sm font-medium">Obligatorio para completar el curso</span>
          <span className="block text-xs text-muted-foreground">
            El alumno deberá aprobar este cuestionario (además de ver todas las lecciones) para que el curso figure como completado y pueda descargar el certificado.
          </span>
        </span>
      </label>

      <Button type="submit" size="sm" disabled={pending}>
        {pending ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
        Guardar ajustes
      </Button>
    </form>
  )
}

// ── Formulario de pregunta ────────────────────────────────
interface QuestionFormProps {
  courseId: string
  quizId?: string
  question?: QuizQuestion
  onDone?: () => void
}

function emptyOptions(): { label: string; isCorrect: boolean }[] {
  return [
    { label: '', isCorrect: true },
    { label: '', isCorrect: false },
  ]
}

function booleanOptions(correctFirst: boolean): { label: string; isCorrect: boolean }[] {
  return [
    { label: 'Verdadero', isCorrect: correctFirst },
    { label: 'Falso', isCorrect: !correctFirst },
  ]
}

function QuestionForm({ courseId, quizId, question, onDone }: QuestionFormProps) {
  const isEdit = !!question
  const action = isEdit ? updateQuestionAction : createQuestionAction
  const [state, formAction, pending] = useActionState(action, null)
  const router = useRouter()

  const [type, setType] = useState<QuizQuestionType>(question?.type ?? 'single')
  const [prompt, setPrompt] = useState(question?.prompt ?? '')
  const [explanation, setExplanation] = useState(question?.explanation ?? '')
  const [options, setOptions] = useState<{ label: string; isCorrect: boolean }[]>(
    question?.options?.map((o) => ({ label: o.label, isCorrect: o.is_correct })) ?? emptyOptions()
  )

  useEffect(() => {
    if (state?.error) toast.error(state.error)
    if (state?.success) {
      toast.success(state.success)
      router.refresh()
      onDone?.()
    }
  }, [state, onDone, router])

  function changeType(next: QuizQuestionType) {
    setType(next)
    if (next === 'boolean') setOptions(booleanOptions(true))
    else if (type === 'boolean') setOptions(emptyOptions())
  }

  function setCorrect(index: number) {
    setOptions((opts) =>
      opts.map((o, i) => ({
        ...o,
        isCorrect: type === 'multiple' ? (i === index ? !o.isCorrect : o.isCorrect) : i === index,
      }))
    )
  }

  function setLabel(index: number, label: string) {
    setOptions((opts) => opts.map((o, i) => (i === index ? { ...o, label } : o)))
  }

  function addOption() {
    setOptions((opts) => (opts.length < 6 ? [...opts, { label: '', isCorrect: false }] : opts))
  }

  function removeOption(index: number) {
    setOptions((opts) => (opts.length > 2 ? opts.filter((_, i) => i !== index) : opts))
  }

  const isBoolean = type === 'boolean'

  // Validación en vivo (espeja la del server action)
  const labelsOk = options.every((o) => o.label.trim().length > 0)
  const correctCount = options.filter((o) => o.isCorrect).length
  const valid =
    prompt.trim().length >= 3 &&
    labelsOk &&
    (type === 'multiple' ? correctCount >= 1 : correctCount === 1)
  const validationMsg = !prompt.trim()
    ? 'Escribe el enunciado de la pregunta'
    : !labelsOk
    ? 'Completa el texto de todas las opciones'
    : correctCount === 0
    ? 'Marca la opción correcta'
    : type !== 'multiple' && correctCount > 1
    ? 'Solo puede haber una opción correcta'
    : null

  return (
    <form action={formAction} className="space-y-4">
      {isEdit && <input type="hidden" name="id" value={question.id} />}
      <input type="hidden" name="course_id" value={courseId} />
      {quizId && <input type="hidden" name="quiz_id" value={quizId} />}
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="explanation" value={explanation} />
      <input type="hidden" name="options" value={JSON.stringify(options)} />

      <div className="space-y-2">
        <Label>Enunciado *</Label>
        <Textarea name="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={2} required placeholder="¿Cuál es…?" />
      </div>

      <div className="space-y-2">
        <Label>Tipo de pregunta</Label>
        <div className="inline-flex rounded-lg border p-0.5">
          {TYPE_OPTIONS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => changeType(t.value)}
              className={cn(
                'px-3 py-1 text-sm rounded-md transition-colors',
                type === t.value ? 'bg-muted font-medium' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>
          Opciones {type === 'multiple' ? '(marca todas las correctas)' : '(marca la correcta)'}
        </Label>
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div
              key={i}
              className={cn(
                'flex items-center gap-2 rounded-md border p-1.5 transition-colors',
                opt.isCorrect ? 'border-green-500/50 bg-green-50 dark:bg-green-950/20' : 'border-transparent'
              )}
            >
              <button
                type="button"
                onClick={() => setCorrect(i)}
                className="shrink-0 text-muted-foreground hover:text-foreground"
                aria-pressed={opt.isCorrect}
                aria-label={`Marcar opción ${i + 1} como correcta`}
                title="Marcar como correcta"
              >
                {opt.isCorrect ? <CheckCircle className="size-5 text-green-600" /> : <Circle className="size-5" />}
              </button>
              <Input
                value={opt.label}
                onChange={(e) => setLabel(i, e.target.value)}
                placeholder={`Opción ${i + 1}`}
                disabled={isBoolean}
                className="border-0 bg-transparent focus-visible:ring-0 shadow-none"
              />
              {opt.isCorrect && <span className="text-[10px] font-medium text-green-700 dark:text-green-400 shrink-0 mr-1">Correcta</span>}
              {!isBoolean && options.length > 2 && (
                <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => removeOption(i)}>
                  <X className="size-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
        {!isBoolean && options.length < 6 && (
          <Button type="button" variant="ghost" size="sm" onClick={addOption}>
            <Plus className="size-3.5 mr-1" /> Añadir opción
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label>Explicación (opcional)</Label>
        <Input value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Por qué la respuesta correcta es correcta" />
      </div>

      {validationMsg && <p className="text-xs text-muted-foreground">{validationMsg}</p>}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending || !valid}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {isEdit ? 'Guardar' : 'Añadir pregunta'}
        </Button>
        {onDone && (
          <Button type="button" variant="ghost" size="sm" onClick={onDone}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}

// ── Contenedor ────────────────────────────────────────────
export function QuizManager({ courseId, course, lessons, quiz, questions }: QuizManagerProps) {
  const [showNew, setShowNew] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete(questionId: string) {
    if (!confirm('¿Eliminar esta pregunta?')) return
    startTransition(async () => {
      await deleteQuestionAction(questionId, courseId)
      toast.success('Pregunta eliminada')
      router.refresh()
    })
  }

  function handleReorder(questionId: string, dir: 'up' | 'down') {
    startTransition(async () => {
      await reorderQuestionAction(questionId, dir, courseId)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ajustes del cuestionario</CardTitle>
        </CardHeader>
        <CardContent>
          <QuizSettings courseId={courseId} quiz={quiz} />
        </CardContent>
      </Card>

      <QuizAiExchange
        courseId={courseId}
        course={course}
        lessons={lessons}
        hasExistingQuestions={questions.length > 0}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {questions.length} {questions.length === 1 ? 'pregunta' : 'preguntas'}
          </p>
          <Button size="sm" onClick={() => setShowNew(!showNew)}>
            <Plus className="size-4 mr-2" />
            Nueva pregunta
          </Button>
        </div>

        {showNew && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Nueva pregunta</CardTitle>
            </CardHeader>
            <CardContent>
              <QuestionForm courseId={courseId} quizId={quiz?.id} onDone={() => setShowNew(false)} />
            </CardContent>
          </Card>
        )}

        {questions.length === 0 && !showNew && (
          <div className="text-center py-10 text-muted-foreground border rounded-lg border-dashed text-sm">
            No hay preguntas todavía. Créalas a mano o genéralas con IA externa.
          </div>
        )}

        <div className="space-y-2">
          {questions.map((q, index) => (
            <div key={q.id} className="rounded-lg border overflow-hidden">
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 select-none"
                onClick={() => setExpanded(expanded === q.id ? null : q.id)}
              >
                <div className="flex flex-col gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleReorder(q.id, 'up')}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed"
                    aria-label="Subir pregunta"
                  >
                    <ChevronUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === questions.length - 1}
                    onClick={() => handleReorder(q.id, 'down')}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed"
                    aria-label="Bajar pregunta"
                  >
                    <ChevronDown className="size-3.5" />
                  </button>
                </div>
                <Badge variant="outline" className="w-7 justify-center text-xs shrink-0">{index + 1}</Badge>
                <span className="flex-1 text-sm">{q.prompt}</span>
                <Badge variant="secondary" className="text-[10px] shrink-0">
                  {TYPE_OPTIONS.find((t) => t.value === q.type)?.label ?? q.type}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(q.id)
                  }}
                >
                  <Trash2 className="size-3.5" />
                </Button>
                <ChevronDown className={cn('size-4 text-muted-foreground transition-transform', expanded === q.id && 'rotate-180')} />
              </div>
              {expanded === q.id && (
                <>
                  <Separator />
                  <div className="p-4">
                    <QuestionForm courseId={courseId} quizId={quiz?.id} question={q} onDone={() => setExpanded(null)} />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
