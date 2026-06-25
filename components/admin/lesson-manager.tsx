'use client'

import { useActionState, useEffect, useOptimistic, useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  createLessonAction,
  updateLessonAction,
  deleteLessonAction,
  uploadNotesAction,
  removeNotesAction,
  reorderLessonAction,
} from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { MarkdownEditor } from '@/components/admin/markdown-editor'
import { Plus, Trash2, ChevronDown, ChevronUp, FileText, Video, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Lesson, LessonContentType } from '@/types'
import { toast } from 'sonner'

interface LessonManagerProps {
  courseId: string
  lessons: Lesson[]
}

interface LessonFormProps {
  courseId: string
  lesson?: Lesson
  nextPosition?: number
  onDone?: () => void
}

function LessonForm({ courseId, lesson, nextPosition, onDone }: LessonFormProps) {
  const isEdit = !!lesson
  const action = isEdit ? updateLessonAction : createLessonAction
  const [state, formAction, pending] = useActionState(action, null)
  const [uploadingNotes, setUploadingNotes] = useState(false)
  const [type, setType] = useState<LessonContentType>(lesson?.content_type ?? 'video')
  const [ytId, setYtId] = useState(lesson?.youtube_video_id ?? '')
  const router = useRouter()

  useEffect(() => {
    if (state?.error) toast.error(state.error)
    if (state?.success) {
      toast.success(state.success)
      router.refresh()
      onDone?.()
    }
  }, [state, onDone, router])

  async function handleNotesUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !lesson) return
    setUploadingNotes(true)
    const fd = new FormData()
    fd.append('notes', file)
    const result = await uploadNotesAction(lesson.id, courseId, fd)
    if (result?.error) toast.error(result.error)
    else toast.success('Apuntes subidos correctamente')
    setUploadingNotes(false)
    e.target.value = ''
  }

  async function handleRemoveNotes() {
    if (!lesson?.notes_pdf_path) return
    await removeNotesAction(lesson.id, courseId, lesson.notes_pdf_path)
    toast.success('Apuntes eliminados')
    router.refresh()
  }

  return (
    <form action={formAction} className="space-y-4">
      {isEdit && <input type="hidden" name="id" value={lesson.id} />}
      <input type="hidden" name="course_id" value={courseId} />
      <input type="hidden" name="content_type" value={type} />

      <div className="space-y-2">
        <Label>Título *</Label>
        <Input name="title" required defaultValue={lesson?.title} placeholder="Ej: Introducción al curso" />
      </div>

      {/* Selector de tipo de contenido */}
      <div className="space-y-2">
        <Label>Tipo de contenido</Label>
        <div className="inline-flex rounded-lg border p-0.5">
          {(['video', 'text'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 text-sm rounded-md transition-colors',
                type === t ? 'bg-muted font-medium' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t === 'video' ? <Video className="size-4" /> : <FileText className="size-4" />}
              {t === 'video' ? 'Vídeo' : 'Texto'}
            </button>
          ))}
        </div>
      </div>

      {type === 'video' ? (
        <div className="space-y-2">
          <Label>ID de vídeo YouTube *</Label>
          <Input
            name="youtube_video_id"
            required
            value={ytId}
            onChange={(e) => setYtId(e.target.value)}
            placeholder="dQw4w9WgXcQ"
          />
          <p className="text-xs text-muted-foreground">
            La parte de la URL tras <code>v=</code>
          </p>
          {ytId.length === 11 && (
            <iframe
              key={ytId}
              src={`https://www.youtube-nocookie.com/embed/${ytId}`}
              className="w-full aspect-video rounded-md border mt-2"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media"
              allowFullScreen
            />
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Label>Contenido (Markdown) *</Label>
          <MarkdownEditor name="body" defaultValue={lesson?.body ?? ''} rows={12} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Posición</Label>
          <Input name="position" type="number" min={1} required defaultValue={lesson?.position ?? nextPosition} />
        </div>
        <div className="space-y-2">
          <Label>{type === 'video' ? 'Tiempo mínimo (min)' : 'Tiempo de lectura (min)'}</Label>
          <Input
            name="min_watch_minutes"
            type="number"
            min={0}
            defaultValue={lesson ? Math.floor(lesson.min_watch_seconds / 60) : 0}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Descripción</Label>
        <Textarea name="description" rows={2} defaultValue={lesson?.description} />
      </div>

      {isEdit && (
        <div className="space-y-2">
          <Label>Apuntes (PDF)</Label>
          {lesson.notes_pdf_path ? (
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Apuntes subidos</span>
              <Button type="button" variant="ghost" size="sm" className="h-6 text-destructive" onClick={handleRemoveNotes}>
                <X className="size-3 mr-1" />
                Quitar
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input type="file" accept="application/pdf" onChange={handleNotesUpload} disabled={uploadingNotes} className="text-sm" />
              {uploadingNotes && <Loader2 className="size-4 animate-spin" />}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {isEdit ? 'Guardar' : 'Crear lección'}
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

export function LessonManager({ courseId, lessons: initialLessons }: LessonManagerProps) {
  const [showNew, setShowNew] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const router = useRouter()

  const [optimisticLessons, moveLesson] = useOptimistic(
    initialLessons,
    (state, { id, dir }: { id: string; dir: 'up' | 'down' }) => {
      const idx = state.findIndex((l) => l.id === id)
      const swapIdx = dir === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= state.length) return state
      const next = [...state]
      ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
      return next
    }
  )

  async function handleDelete(lessonId: string) {
    if (!confirm('¿Eliminar esta lección?')) return
    await deleteLessonAction(lessonId, courseId)
    toast.success('Lección eliminada')
    router.refresh()
  }

  function handleReorder(lessonId: string, dir: 'up' | 'down') {
    startTransition(async () => {
      moveLesson({ id: lessonId, dir })
      await reorderLessonAction(lessonId, dir, courseId)
      router.refresh()
    })
  }

  const nextPosition = (initialLessons[initialLessons.length - 1]?.position ?? 0) + 1

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {initialLessons.length} {initialLessons.length === 1 ? 'lección' : 'lecciones'}
        </p>
        <Button size="sm" onClick={() => setShowNew(!showNew)}>
          <Plus className="size-4 mr-2" />
          Nueva lección
        </Button>
      </div>

      {showNew && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nueva lección</CardTitle>
          </CardHeader>
          <CardContent>
            <LessonForm courseId={courseId} nextPosition={nextPosition} onDone={() => setShowNew(false)} />
          </CardContent>
        </Card>
      )}

      {initialLessons.length === 0 && !showNew && (
        <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
          <p className="text-sm">No hay lecciones todavía.</p>
          <Button variant="link" size="sm" onClick={() => setShowNew(true)}>
            Añadir la primera lección
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {optimisticLessons.map((lesson, index) => (
          <div key={lesson.id} className="rounded-lg border overflow-hidden">
            <div
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 select-none"
              onClick={() => setExpanded(expanded === lesson.id ? null : lesson.id)}
            >
              <div className="flex flex-col gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => handleReorder(lesson.id, 'up')}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed"
                  aria-label="Subir lección"
                >
                  <ChevronUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  disabled={index === optimisticLessons.length - 1}
                  onClick={() => handleReorder(lesson.id, 'down')}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed"
                  aria-label="Bajar lección"
                >
                  <ChevronDown className="size-3.5" />
                </button>
              </div>

              <Badge variant="outline" className="w-8 justify-center text-xs shrink-0">
                {lesson.position}
              </Badge>
              <span className="flex-1 font-medium text-sm">{lesson.title}</span>
              <Badge variant="secondary" className="text-xs gap-1 shrink-0">
                {lesson.content_type === 'text' ? <FileText className="size-3" /> : <Video className="size-3" />}
                {lesson.content_type === 'text' ? 'Texto' : 'Vídeo'}
              </Badge>
              {lesson.notes_pdf_path && <FileText className="size-3.5 text-muted-foreground" />}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(lesson.id)
                }}
              >
                <Trash2 className="size-3.5" />
              </Button>
              <ChevronDown
                className={cn('size-4 text-muted-foreground transition-transform', expanded === lesson.id && 'rotate-180')}
              />
            </div>

            {expanded === lesson.id && (
              <>
                <Separator />
                <div className="p-4">
                  <LessonForm courseId={courseId} lesson={lesson} onDone={() => setExpanded(null)} />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
