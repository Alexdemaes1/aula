'use client'

import { useTransition } from 'react'
import { toggleCoursePublishedAction } from '@/app/actions/admin'
import { cn } from '@/lib/utils'

interface Props {
  courseId: string
  isPublished: boolean
}

export function TogglePublishedButton({ courseId, isPublished }: Props) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() =>
        startTransition(() => toggleCoursePublishedAction(courseId, isPublished))
      }
      disabled={isPending}
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
        isPending && 'opacity-60 cursor-wait',
        isPublished
          ? 'bg-primary/10 text-primary hover:bg-destructive/10 hover:text-destructive'
          : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
      )}
      title={isPublished ? 'Haz clic para ocultar' : 'Haz clic para publicar'}
    >
      {isPublished ? 'Publicado' : 'Borrador'}
    </button>
  )
}
