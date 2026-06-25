'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CheckCircle, Lock, Play, Circle, ChevronLeft, Menu, X, Trophy, FileText, HelpCircle, Award } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

interface SidebarLesson {
  id: string
  title: string
  position: number
  contentType?: 'video' | 'text'
  completed: boolean
  unlocked: boolean
  current?: boolean
}

interface SidebarQuiz {
  id: string
  title: string
  required: boolean
  passed: boolean
}

interface LessonSidebarProps {
  courseSlug: string
  courseTitle: string
  lessons: SidebarLesson[]
  quizzes?: SidebarQuiz[]
}

export function LessonSidebar({ courseSlug, courseTitle, lessons, quizzes = [] }: LessonSidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const requiredQuiz = quizzes.find((q) => q.required)
  const optionalQuizzes = quizzes.filter((q) => !q.required)
  const lessonsDone = lessons.filter((l) => l.completed).length
  // El quiz obligatorio cuenta como un paso más en el progreso.
  const denom = lessons.length + (requiredQuiz ? 1 : 0)
  const numer = lessonsDone + (requiredQuiz?.passed ? 1 : 0)
  const percent = denom > 0 ? Math.round((numer / denom) * 100) : 0
  const isComplete = percent === 100
  const lessonsAllDone = lessons.length > 0 && lessonsDone === lessons.length

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
        className={cn(
          'fixed bottom-4 left-4 z-40 md:hidden flex items-center gap-2 px-3 py-2.5 rounded-full shadow-lg text-xs font-medium',
          isComplete ? 'bg-green-600 text-white' : 'bg-primary text-primary-foreground'
        )}
        aria-label="Ver lecciones"
      >
        {isComplete ? <Trophy className="size-4" /> : <Menu className="size-4" />}
        {isComplete ? '¡Completado!' : `${numer}/${denom}`}
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
              <span>{numer}/{denom}</span>
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
                        lesson.contentType === 'text' ? (
                          <FileText className="size-4 text-primary-foreground/80" />
                        ) : (
                          <Play className="size-4 fill-current text-primary-foreground/80" />
                        )
                      ) : lesson.contentType === 'text' ? (
                        <FileText className="size-4 text-muted-foreground" />
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

        {/* Evaluación final obligatoria */}
        {requiredQuiz && (
          <div className="border-t p-2">
            <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Evaluación final
            </p>
            <Link
              href={`/learn/${courseSlug}/quiz/${requiredQuiz.id}`}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors',
                pathname.includes(requiredQuiz.id)
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <span className="flex-shrink-0">
                {requiredQuiz.passed ? (
                  <CheckCircle className="size-4 text-green-500" />
                ) : (
                  <HelpCircle className="size-4 text-amber-500" />
                )}
              </span>
              <span className="leading-tight line-clamp-2 flex-1">{requiredQuiz.title}</span>
              {!requiredQuiz.passed && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                  Obligatorio
                </span>
              )}
            </Link>
          </div>
        )}

        {/* Autoevaluaciones opcionales */}
        {optionalQuizzes.length > 0 && (
          <div className="border-t p-2">
            <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Autoevaluación
            </p>
            {optionalQuizzes.map((q) => {
              const isCurrent = pathname.includes(q.id)
              return (
                <Link
                  key={q.id}
                  href={`/learn/${courseSlug}/quiz/${q.id}`}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors',
                    isCurrent ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <HelpCircle className="size-4 flex-shrink-0" />
                  <span className="leading-tight line-clamp-2">{q.title}</span>
                </Link>
              )
            })}
          </div>
        )}

        {/* Estado de completación */}
        {isComplete ? (
          <div className="p-4 border-t space-y-2">
            <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-800 text-center">
              ¡Curso completado!
            </div>
            <a
              href={`/learn/${courseSlug}/certificate`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-medium hover:opacity-90 transition-opacity"
            >
              <Award className="size-3.5" />
              Descargar certificado
            </a>
          </div>
        ) : lessonsAllDone && requiredQuiz && !requiredQuiz.passed ? (
          <div className="p-4 border-t">
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800 text-center">
              Aprueba la evaluación final para completar el curso.
            </div>
          </div>
        ) : null}
      </aside>
    </>
  )
}
