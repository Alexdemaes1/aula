'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Markdown } from '@/components/markdown'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface TextLessonProps {
  body: string
  lessonId: string
  minWatchSeconds: number
  initialWatched: number
  initialCompleted: boolean
  courseSlug: string
  nextLessonId?: string
}

export function TextLesson({
  body,
  lessonId,
  minWatchSeconds,
  initialWatched,
  initialCompleted,
  courseSlug,
  nextLessonId,
}: TextLessonProps) {
  const [completed, setCompleted] = useState(initialCompleted)
  const [watched, setWatched] = useState(initialWatched)
  const [pending, setPending] = useState(false)
  const [readSize, setReadSize] = useState<'s' | 'm' | 'l'>('m')
  const sinceFlush = useRef(0)
  const router = useRouter()

  // Modo lectura: tamaño de texto persistido.
  useEffect(() => {
    try {
      const v = localStorage.getItem('tyf-read-size')
      if (v === 's' || v === 'm' || v === 'l') setReadSize(v)
    } catch {}
  }, [])
  function changeReadSize(v: 's' | 'm' | 'l') {
    setReadSize(v)
    try {
      localStorage.setItem('tyf-read-size', v)
    } catch {}
  }
  const READ_PX: Record<'s' | 'm' | 'l', string> = { s: '0.9375rem', m: '1.0625rem', l: '1.2rem' }

  // Temporizador de lectura: cuenta segundos y envía heartbeats cada 10 s.
  useEffect(() => {
    if (completed) return
    const id = setInterval(() => {
      setWatched((w) => w + 1)
      sinceFlush.current += 1
      if (sinceFlush.current >= 10) {
        const delta = sinceFlush.current
        sinceFlush.current = 0
        fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessonId, deltaSeconds: Math.min(delta, 15), position: 0, reachedEnd: false }),
        }).catch(() => {})
      }
    }, 1000)
    return () => clearInterval(id)
  }, [completed, lessonId])

  const canComplete = watched >= minWatchSeconds
  const remaining = Math.max(0, minWatchSeconds - watched)

  async function markComplete() {
    setPending(true)
    try {
      // Flush del tiempo de lectura pendiente para que el servidor vea watched_seconds
      // actualizado antes de validar el tiempo mínimo (evita rechazos por desfase).
      const delta = sinceFlush.current
      sinceFlush.current = 0
      if (delta > 0) {
        await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessonId, deltaSeconds: Math.min(delta, 15), position: 0, reachedEnd: false }),
        }).catch(() => {})
      }
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, markComplete: true }),
      })
      if (!res.ok) throw new Error()
      setCompleted(true)
      toast.success('Lección completada')
      router.refresh()
    } catch {
      toast.error('No se pudo guardar el progreso')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Modo lectura: tamaño de texto */}
      <div className="flex items-center justify-end gap-1">
        <span className="text-xs text-muted-foreground mr-1">Texto</span>
        {(['s', 'm', 'l'] as const).map((v, i) => (
          <button
            key={v}
            type="button"
            onClick={() => changeReadSize(v)}
            aria-label={`Tamaño de texto ${v === 's' ? 'pequeño' : v === 'm' ? 'mediano' : 'grande'}`}
            aria-pressed={readSize === v}
            className={
              'flex items-center justify-center size-7 rounded-md border transition-colors ' +
              (readSize === v ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent')
            }
          >
            <span className="font-heading" style={{ fontSize: `${0.7 + i * 0.18}rem` }}>A</span>
          </button>
        ))}
      </div>

      <div style={{ fontSize: READ_PX[readSize] }}>
        <Markdown source={body} className="lesson-prose" />
      </div>

      <div className="border-t pt-4">
        {completed ? (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <CheckCircle className="size-4" />
            Lección completada
            {nextLessonId && (
              <a href={`/learn/${courseSlug}/${nextLessonId}`} className="ml-auto text-primary underline underline-offset-2 hover:no-underline">
                Siguiente lección →
              </a>
            )}
          </div>
        ) : (
          <Button onClick={markComplete} disabled={!canComplete || pending}>
            {pending
              ? 'Guardando…'
              : canComplete
              ? 'Marcar como completada'
              : `Lee durante ${remaining}s para continuar`}
          </Button>
        )}
      </div>
    </div>
  )
}
