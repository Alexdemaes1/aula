'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CheckCircle, Lock, Play, Circle, ChevronLeft, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

interface SidebarLesson {
  id: string
  title: string
  position: number
  completed: boolean
  unlocked: boolean
  current?: boolean
}

interface LessonSidebarProps {
  courseSlug: string
  courseTitle: string
  lessons: SidebarLesson[]
}

export function LessonSidebar({ courseSlug, courseTitle, lessons }: LessonSidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const completed = lessons.filter((l) => l.completed).length
  const percent = lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      {/* Botón toggle solo en móvil */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-40 md:hidden flex items-center gap-2 px-3 py-2.5 rounded-full shadow-lg bg-primary text-primary-foreground text-xs font-medium"
        aria-label="Ver lecciones"
      >
        <Menu className="size-4" />
        {completed}/{lessons.length}
      </button>

      {/* Overlay en móvil (empieza bajo el header) */}
      {open && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 bg-black/40 md:hidden"
          style={{ top: '3.5rem' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'flex-shrink-0 border-r bg-muted/20 flex flex-col h-full overflow-hidden transition-transform duration-200',
          'fixed z-50 bottom-0 left-0 w-72 md:relative md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
        style={{ top: 'var(--app-header-height, 3.5rem)' }}
      >
        <div className="p-4 border-b space-y-2">
          <div className="flex items-center justify-between">
            <Link
              href={`/courses/${courseSlug}`}
              className="text-xs text-muted-foreground hover:underline flex items-center gap-1 truncate"
            >
              <ChevronLeft className="size-3 flex-shrink-0" />
              <span className="truncate">{courseTitle}</span>
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="md:hidden ml-2 flex-shrink-0 text-muted-foreground hover:text-foreground"
              aria-label="Cerrar"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progreso</span>
              <span>{completed}/{lessons.length}</span>
            </div>
            <Progress value={percent} className="h-1.5" />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {lessons.map((lesson) => {
            const isCurrent = pathname.includes(lesson.id)
            return (
              <div key={lesson.id}>
                {lesson.unlocked ? (
                  <Link
                    href={`/learn/${courseSlug}/${lesson.id}`}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors group',
                      isCurrent
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <span className="flex-shrink-0">
                      {lesson.completed ? (
                        <CheckCircle className={cn('size-4', isCurrent ? 'text-green-300' : 'text-green-500')} />
                      ) : isCurrent ? (
                        <Play className="size-4 fill-current text-primary-foreground/80" />
                      ) : (
                        <Circle className="size-4 text-muted-foreground" />
                      )}
                    </span>
                    <span className="leading-tight line-clamp-2">{lesson.title}</span>
                    {isCurrent && (
                      <span className="ml-auto flex-shrink-0 text-xs font-medium px-1.5 py-0.5 rounded bg-primary-foreground/20 text-primary-foreground">
                        {lesson.position}
                      </span>
                    )}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground/60 cursor-not-allowed">
                    <Lock className="size-4 flex-shrink-0" />
                    <span className="leading-tight line-clamp-2">{lesson.title}</span>
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {percent === 100 && (
          <div className="p-4 border-t">
            <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-800 text-center">
              ¡Curso completado!
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
