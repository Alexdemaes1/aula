'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, RotateCcw, Trophy } from 'lucide-react'
import { submitQuizAttempt, type QuizSubmitResult } from '@/app/actions/quiz'
import { toast } from 'sonner'

interface RunnerOption {
  id: string
  label: string
}
interface RunnerQuestion {
  id: string
  prompt: string
  type: 'single' | 'multiple' | 'boolean'
  explanation: string
  options: RunnerOption[]
}

interface QuizRunnerProps {
  quizId: string
  title: string
  passingScore: number
  maxAttempts: number | null
  attemptsUsed: number
  questions: RunnerQuestion[]
  courseSlug: string
}

export function QuizRunner({
  quizId,
  title,
  passingScore,
  maxAttempts,
  attemptsUsed,
  questions,
  courseSlug,
}: QuizRunnerProps) {
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [result, setResult] = useState<QuizSubmitResult | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const noAttemptsLeft = maxAttempts != null && attemptsUsed >= maxAttempts
  const allAnswered = questions.every((q) => (answers[q.id]?.length ?? 0) > 0)

  function select(question: RunnerQuestion, optionId: string) {
    setAnswers((prev) => {
      if (question.type === 'multiple') {
        const cur = prev[question.id] ?? []
        return {
          ...prev,
          [question.id]: cur.includes(optionId) ? cur.filter((x) => x !== optionId) : [...cur, optionId],
        }
      }
      return { ...prev, [question.id]: [optionId] }
    })
  }

  function handleSubmit() {
    startTransition(async () => {
      const r = await submitQuizAttempt(quizId, answers)
      if (!r.ok) {
        toast.error(r.error ?? 'No se pudo enviar')
        return
      }
      setResult(r)
      router.refresh()
    })
  }

  function retry() {
    setAnswers({})
    setResult(null)
  }

  // ── Resultado ──
  if (result?.ok) {
    const passed = result.passed
    const attemptsLeft = result.attemptsLeft
    return (
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        <Card className={passed ? 'border-green-500/40' : 'border-destructive/40'}>
          <CardContent className="pt-6 text-center space-y-2">
            {passed ? (
              <Trophy className="size-10 mx-auto text-green-500" />
            ) : (
              <XCircle className="size-10 mx-auto text-destructive" />
            )}
            <p className="text-3xl font-bold">{result.scorePct}%</p>
            <p className={passed ? 'text-green-600 dark:text-green-400 font-medium' : 'text-destructive font-medium'}>
              {passed ? '¡Has aprobado!' : `No alcanzaste el ${passingScore}% necesario`}
            </p>
          </CardContent>
        </Card>

        {/* Revisión por pregunta */}
        <div className="space-y-3">
          {questions.map((q, i) => {
            const corr = result.corrections?.[q.id]
            const isCorrect = corr?.correct
            return (
              <div key={q.id} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-start gap-2">
                  {isCorrect ? (
                    <CheckCircle className="size-4 text-green-500 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="size-4 text-destructive mt-0.5 shrink-0" />
                  )}
                  <span className="font-medium text-sm">{i + 1}. {q.prompt}</span>
                </div>
                <ul className="pl-6 space-y-1 text-sm">
                  {q.options.map((o) => {
                    const isRight = corr?.correctOptionIds.includes(o.id)
                    const wasChosen = corr?.chosenOptionIds.includes(o.id)
                    return (
                      <li
                        key={o.id}
                        className={
                          isRight
                            ? 'text-green-600 dark:text-green-400'
                            : wasChosen
                            ? 'text-destructive line-through'
                            : 'text-muted-foreground'
                        }
                      >
                        {isRight ? '✓ ' : wasChosen ? '✗ ' : '· '}
                        {o.label}
                      </li>
                    )
                  })}
                </ul>
                {q.explanation && <p className="pl-6 text-xs text-muted-foreground italic">{q.explanation}</p>}
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          {!passed && attemptsLeft !== 0 && (
            <Button onClick={retry}>
              <RotateCcw className="size-4 mr-1.5" />
              Reintentar
            </Button>
          )}
          {attemptsLeft != null && (
            <p className="text-sm text-muted-foreground">
              {attemptsLeft === 0 ? 'Sin intentos restantes' : `${attemptsLeft} intento(s) restante(s)`}
            </p>
          )}
          <a href={`/learn/${courseSlug}`} className="text-sm text-primary underline underline-offset-2 hover:no-underline ml-auto">
            Volver al curso
          </a>
        </div>
      </div>
    )
  }

  // ── Cuestionario ──
  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
      <div className="space-y-1">
        <Badge variant="outline" className="text-xs">Autoevaluación</Badge>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">
          {questions.length} pregunta(s) · Aprobado al {passingScore}%
          {maxAttempts != null && ` · ${Math.max(0, maxAttempts - attemptsUsed)} intento(s) restante(s)`}
        </p>
      </div>

      {noAttemptsLeft ? (
        <Card>
          <CardContent className="pt-6 text-center text-sm text-muted-foreground">
            Has agotado los intentos de este cuestionario.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {questions.map((q, i) => (
              <div key={q.id} className="rounded-lg border p-4 space-y-3">
                <p className="font-medium text-sm">
                  {i + 1}. {q.prompt}
                  {q.type === 'multiple' && (
                    <span className="ml-2 text-xs text-muted-foreground font-normal">(varias respuestas)</span>
                  )}
                </p>
                <div className="space-y-2">
                  {q.options.map((o) => {
                    const checked = (answers[q.id] ?? []).includes(o.id)
                    return (
                      <label key={o.id} className="flex items-center gap-2.5 text-sm cursor-pointer">
                        <input
                          type={q.type === 'multiple' ? 'checkbox' : 'radio'}
                          name={`q-${q.id}`}
                          checked={checked}
                          onChange={() => select(q, o.id)}
                          className="accent-primary size-4"
                        />
                        {o.label}
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <Button onClick={handleSubmit} disabled={!allAnswered || pending}>
            {pending ? 'Enviando…' : 'Enviar respuestas'}
          </Button>
          {!allAnswered && <p className="text-xs text-muted-foreground">Responde todas las preguntas para enviar.</p>}
        </>
      )}
    </div>
  )
}
