'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CheckCircle, Lock, Play, Circle } from 'lucide-react'
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
  const completed = lessons.filter((l) => l.completed).length
  const percent = lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0

  return (
    <aside className="w-72 flex-shrink-0 border-r bg-muted/20 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b space-y-2">
        <Link href={`/courses/${courseSlug}`} className="text-xs text-muted-foreground hover:underline block truncate">
          ← {courseTitle}
        </Link>
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
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors group',
                    isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <span className={cn('flex-shrink-0', isCurrent ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                    {lesson.completed ? (
                      <CheckCircle className="size-4 text-green-500" />
                    ) : isCurrent ? (
                      <Play className="size-4 fill-current" />
                    ) : (
                      <Circle className="size-4" />
                    )}
                  </span>
                  <span className="leading-tight line-clamp-2">{lesson.title}</span>
                  <span className={cn(
                    'ml-auto flex-shrink-0 text-xs font-medium px-1.5 py-0.5 rounded',
                    isCurrent ? 'bg-primary-foreground/20 text-primary-foreground' : 'hidden'
                  )}>
                    {lesson.position}
                  </span>
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
            🎉 ¡Curso completado!
          </div>
        </div>
      )}
    </aside>
  )
}
