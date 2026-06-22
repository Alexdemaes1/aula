'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        options: {
          videoId: string
          playerVars?: Record<string, number | string>
          events: {
            onReady?: (e: { target: YouTubePlayerInstance }) => void
            onStateChange?: (e: { data: number }) => void
          }
        }
      ) => YouTubePlayerInstance
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number }
    }
    onYouTubeIframeAPIReady?: () => void
  }
  interface YouTubePlayerInstance {
    getCurrentTime(): number
    getDuration(): number
    getPlayerState(): number
    destroy(): void
  }
}

interface YouTubePlayerProps {
  videoId: string
  lessonId: string
  minWatchSeconds: number
  initialWatched: number
  initialCompleted: boolean
  courseSlug: string
  nextLessonId?: string
}

export function YouTubePlayer({
  videoId,
  lessonId,
  minWatchSeconds,
  initialWatched,
  initialCompleted,
  courseSlug,
  nextLessonId,
}: YouTubePlayerProps) {
  const playerRef = useRef<YouTubePlayerInstance | null>(null)
  const watchedRef = useRef(initialWatched)
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
          if (data.completed && !completed) {
            setCompleted(true)
            router.refresh()
          }
        }
      } catch {
        // silenciar errores de red
      }
    },
    [lessonId, completed, router]
  )

  useEffect(() => {
    watchedRef.current = initialWatched
    setWatched(initialWatched)
    setCompleted(initialCompleted)
  }, [lessonId, initialWatched, initialCompleted])

  useEffect(() => {
    let apiReady = false

    function initPlayer() {
      playerRef.current = new window.YT.Player('yt-player', {
        videoId,
        playerVars: { rel: 0, modestbranding: 1, fs: 1 },
        events: {
          onStateChange: ({ data }) => {
            const PLAYING = 1
            const ENDED = 0
            clearInterval(intervalRef.current)

            if (data === PLAYING) {
              intervalRef.current = setInterval(() => {
                if (document.visibilityState === 'visible' && playerRef.current) {
                  const pos = Math.floor(playerRef.current.getCurrentTime())
                  sendHeartbeat(5, pos, false)
                }
              }, 5000)
            }

            if (data === ENDED && playerRef.current) {
              const dur = Math.floor(playerRef.current.getDuration())
              sendHeartbeat(0, dur, true)
            }
          },
        },
      })
    }

    if (window.YT?.Player) {
      initPlayer()
    } else {
      window.onYouTubeIframeAPIReady = initPlayer
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        document.head.appendChild(tag)
      }
    }

    return () => {
      clearInterval(intervalRef.current)
      playerRef.current?.destroy()
    }
  }, [videoId, sendHeartbeat])

  const percent = minWatchSeconds > 0 ? Math.min(100, Math.round((watched / minWatchSeconds) * 100)) : 100
  const remaining = Math.max(0, minWatchSeconds - watched)

  return (
    <div className="space-y-3">
      <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
        <div id="yt-player" className="w-full h-full" />
      </div>

      {completed && (
        <div className="flex items-center gap-2 text-sm text-green-700">
          <CheckCircle className="size-4" />
          Lección completada
          {nextLessonId && (
            <a
              href={`/learn/${courseSlug}/${nextLessonId}`}
              className="ml-auto text-sm underline text-primary"
            >
              Siguiente lección →
            </a>
          )}
        </div>
      )}

      {minWatchSeconds > 0 && !completed && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="size-3" />
              Tiempo visto
            </div>
            <span>
              {remaining > 0
                ? `Faltan ${Math.floor(remaining / 60)}m ${remaining % 60}s para completar`
                : 'Llega al final del vídeo para completar'}
            </span>
          </div>
          <Progress value={percent} className="h-1.5" />
        </div>
      )}
    </div>
  )
}
