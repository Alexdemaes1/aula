'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Clock, AudioLines } from 'lucide-react'

interface AudioPlayerProps {
  url: string | null
  lessonId: string
  minWatchSeconds: number
  initialWatched: number
  initialPosition?: number
  initialCompleted: boolean
  courseSlug: string
  nextLessonId?: string
}

/** Reproductor de audio privado. Mismo patrón de heartbeats que YouTubePlayer. */
export function AudioPlayer({
  url,
  lessonId,
  minWatchSeconds,
  initialWatched,
  initialPosition = 0,
  initialCompleted,
  courseSlug,
  nextLessonId,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const watchedRef = useRef(initialWatched)
  const completedRef = useRef(initialCompleted)
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const [watched, setWatched] = useState(initialWatched)
  const [completed, setCompleted] = useState(initialCompleted)
  const router = useRouter()

  const sendHeartbeat = useCallback(
    async (deltaSeconds: number, position: number, reachedEnd: boolean) => {
      try {
        const res = await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessonId, deltaSeconds, position, reachedEnd }),
        })
        if (res.ok) {
          const data = await res.json()
          watchedRef.current = data.watchedSeconds
          setWatched(data.watchedSeconds)
          if (data.completed && !completedRef.current) {
            completedRef.current = true
            setCompleted(true)
            router.refresh()
          }
        }
      } catch {
        // silenciar errores de red
      }
    },
    [lessonId, router]
  )

  useEffect(() => {
    watchedRef.current = initialWatched
    completedRef.current = initialCompleted
    setWatched(initialWatched)
    setCompleted(initialCompleted)
  }, [lessonId, initialWatched, initialCompleted])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    function onLoaded() {
      if (initialPosition > 1 && !completedRef.current && audio) {
        try {
          audio.currentTime = initialPosition
        } catch {}
      }
    }
    function onPlay() {
      clearInterval(intervalRef.current)
      intervalRef.current = setInterval(() => {
        if (document.visibilityState === 'visible' && audioRef.current) {
          sendHeartbeat(10, Math.floor(audioRef.current.currentTime), false)
        }
      }, 10000)
    }
    function stop() {
      clearInterval(intervalRef.current)
    }
    function onEnded() {
      clearInterval(intervalRef.current)
      if (audio) sendHeartbeat(0, Math.floor(audio.duration || 0), true)
    }
    function flushOnHide() {
      if (document.visibilityState === 'hidden' && audioRef.current && !audioRef.current.paused) {
        sendHeartbeat(10, Math.floor(audioRef.current.currentTime), false)
      }
    }

    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', stop)
    audio.addEventListener('ended', onEnded)
    document.addEventListener('visibilitychange', flushOnHide)
    return () => {
      clearInterval(intervalRef.current)
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', stop)
      audio.removeEventListener('ended', onEnded)
      document.removeEventListener('visibilitychange', flushOnHide)
    }
  }, [url, initialPosition, sendHeartbeat])

  const percent = minWatchSeconds > 0 ? Math.min(100, Math.round((watched / minWatchSeconds) * 100)) : 100
  const remaining = Math.max(0, minWatchSeconds - watched)

  return (
    <div className="space-y-3">
      {url ? (
        <div className="rounded-xl border bg-gradient-to-br from-brand-dark to-brand-jade p-6 flex flex-col items-center gap-4">
          <div className="size-16 rounded-full bg-brand-gold/15 flex items-center justify-center">
            <AudioLines className="size-8 text-brand-gold" />
          </div>
          <audio ref={audioRef} src={url} controls controlsList="nodownload" className="w-full max-w-md" />
        </div>
      ) : (
        <div className="aspect-video w-full rounded-xl bg-muted border border-dashed flex flex-col items-center justify-center gap-2 text-center px-6">
          <AudioLines className="size-8 text-muted-foreground/50" />
          <p className="text-sm font-medium">Audio no disponible</p>
        </div>
      )}

      {completed && (
        <div className="flex items-center gap-2 text-sm text-green-700">
          <CheckCircle className="size-4" />
          Lección completada
          {nextLessonId && (
            <a href={`/learn/${courseSlug}/${nextLessonId}`} className="ml-auto text-sm underline text-primary">
              Siguiente lección →
            </a>
          )}
        </div>
      )}

      {minWatchSeconds > 0 && !completed && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="size-3" /> Tiempo escuchado
            </div>
            <span>
              {remaining > 0
                ? `Faltan ${Math.floor(remaining / 60)}m ${remaining % 60}s para completar`
                : 'Escucha hasta el final para completar'}
            </span>
          </div>
          <Progress value={percent} className="h-1.5" />
        </div>
      )}
    </div>
  )
}
