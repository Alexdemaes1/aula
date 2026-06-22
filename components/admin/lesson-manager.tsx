'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  createLessonAction,
  updateLessonAction,
  deleteLessonAction,
  uploadNotesAction,
  removeNotesAction,
} from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash2, ChevronDown, ChevronUp, FileText, X, Loader2 } from 'lucide-react'
import type { Lesson } from '@/types'
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
  }

  return (
    <form action={formAction} className="space-y-4">
      {isEdit && <input type="hidden" name="id" value={lesson.id} />}
      <input type="hidden" name="course_id" value={courseId} />

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <Label>Título *</Label>
          <Input name="title" required defaultValue={lesson?.title} placeholder="Ej: Introducción al curso" />
        </div>

        <div className="space-y-2">
          <Label>ID de vídeo YouTube *</Label>
          <Input
            name="youtube_video_id"
            required
            defaultValue={lesson?.youtube_video_id}
            placeholder="dQw4w9WgXcQ"
          />
          <p className="text-xs text-muted-foreground">
            La parte de la URL tras <code>v=</code>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>Posición</Label>
            <Input
              name="position"
              type="number"
              min={1}
              required
              defaultValue={lesson?.position ?? nextPosition}
            />
          </div>
          <div className="space-y-2">
            <Label>Tiempo mínimo (min)</Label>
            <Input
              name="min_watch_minutes"
              type="number"
              min={0}
              defaultValue={lesson ? Math.floor(lesson.min_watch_seconds / 60) : 0}
            />
          </div>
        </div>

        <div className="col-span-2 space-y-2">
          <Label>Descripción</Label>
          <Textarea name="description" rows={2} defaultValue={lesson?.description} />
        </div>
      </div>

      {isEdit && (
        <div className="space-y-2">
          <Label>Apuntes (PDF)</Label>
          {lesson.notes_pdf_path ? (
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Apuntes subidos</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 text-destructive"
                onClick={handleRemoveNotes}
              >
                <X className="size-3 mr-1" />
                Quitar
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="application/pdf"
                onChange={handleNotesUpload}
                disabled={uploadingNotes}
                className="text-sm"
              />
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
  const router = useRouter()

  async function handleDelete(lessonId: string) {
    if (!confirm('¿Eliminar esta lección?')) return
    await deleteLessonAction(lessonId, courseId)
    toast.success('Lección eliminada')
    router.refresh()
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
            <LessonForm
              courseId={courseId}
              nextPosition={nextPosition}
              onDone={() => setShowNew(false)}
            />
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
        {initialLessons.map((lesson) => (
          <div key={lesson.id} className="rounded-lg border overflow-hidden">
            <div
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 select-none"
              onClick={() => setExpanded(expanded === lesson.id ? null : lesson.id)}
            >
              <Badge variant="outline" className="w-8 justify-center text-xs">
                {lesson.position}
              </Badge>
              <span className="flex-1 font-medium text-sm">{lesson.title}</span>
              {lesson.notes_pdf_path && (
                <FileText className="size-3.5 text-muted-foreground" />
              )}
              <span className="text-xs text-muted-foreground hidden sm:block">
                {lesson.youtube_video_id}
              </span>
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
              {expanded === lesson.id ? (
                <ChevronUp className="size-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="size-4 text-muted-foreground" />
              )}
            </div>

            {expanded === lesson.id && (
              <>
                <Separator />
                <div className="p-4">
                  <LessonForm
                    courseId={courseId}
                    lesson={lesson}
                    onDone={() => setExpanded(null)}
                  />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
