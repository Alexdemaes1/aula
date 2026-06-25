'use client'

import { useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, X, Loader2, Globe, EyeOff } from 'lucide-react'
import { toggleCoursePublishedAction } from '@/app/actions/admin'
import { toast } from 'sonner'

interface PublishChecklistProps {
  courseId: string
  isPublished: boolean
  hasCover: boolean
  lessonCount: number
  priceConfigured: boolean
  hasQuiz: boolean
}

export function PublishChecklist({
  courseId,
  isPublished,
  hasCover,
  lessonCount,
  priceConfigured,
  hasQuiz,
}: PublishChecklistProps) {
  const [pending, startTransition] = useTransition()

  const items = [
    { label: 'Portada subida', ok: hasCover, critical: true },
    { label: 'Al menos una lección', ok: lessonCount > 0, critical: true },
    { label: 'Precio configurado o gratuito', ok: priceConfigured, critical: true },
    { label: 'Cuestionario de autoevaluación', ok: hasQuiz, critical: false },
  ]
  const ready = items.filter((i) => i.critical).every((i) => i.ok)

  function handleToggle() {
    startTransition(async () => {
      await toggleCoursePublishedAction(courseId, isPublished)
      toast.success(isPublished ? 'Curso despublicado' : 'Curso publicado')
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Estado de publicación</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.label} className="flex items-center gap-2 text-sm">
              {item.ok ? (
                <Check className="size-4 text-primary shrink-0" />
              ) : (
                <X className={`size-4 shrink-0 ${item.critical ? 'text-destructive' : 'text-muted-foreground'}`} />
              )}
              <span className={item.ok ? '' : 'text-muted-foreground'}>
                {item.label}
                {!item.critical && <span className="text-xs text-muted-foreground"> (opcional)</span>}
              </span>
            </li>
          ))}
        </ul>

        <div className="pt-1">
          {isPublished ? (
            <div className="flex items-center gap-2 text-sm text-primary mb-2">
              <Globe className="size-4" /> Publicado y visible en el catálogo
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <EyeOff className="size-4" /> Borrador — no visible
            </div>
          )}
          <Button
            type="button"
            variant={isPublished ? 'outline' : 'default'}
            size="sm"
            className="w-full"
            disabled={pending || (!ready && !isPublished)}
            onClick={handleToggle}
          >
            {pending ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
            {isPublished ? 'Despublicar' : 'Publicar curso'}
          </Button>
          {!ready && !isPublished && (
            <p className="text-xs text-muted-foreground mt-2">
              Completa los requisitos obligatorios para poder publicar.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
