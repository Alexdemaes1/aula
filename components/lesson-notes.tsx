'use client'

import { useState, useTransition } from 'react'
import { saveLessonNoteAction } from '@/app/actions/lesson-notes'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { NotebookPen, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'

export function LessonNotes({ lessonId, initialContent }: { lessonId: string; initialContent: string }) {
  const [content, setContent] = useState(initialContent)
  const [saved, setSaved] = useState(initialContent)
  const [pending, start] = useTransition()
  const dirty = content !== saved

  function save() {
    start(async () => {
      const r = await saveLessonNoteAction(lessonId, content)
      if (r?.error) toast.error(r.error)
      else {
        setSaved(content)
        toast.success('Notas guardadas')
      }
    })
  }

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <NotebookPen className="size-4 text-primary" />
        <span className="text-sm font-medium">Mis notas</span>
      </div>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        maxLength={5000}
        placeholder="Anota lo que quieras recordar de esta lección…"
        className="resize-y"
      />
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={save} disabled={pending || !dirty}>
          {pending ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
          Guardar notas
        </Button>
        {!dirty && saved && (
          <span className="text-xs text-emerald-600 flex items-center gap-1">
            <Check className="size-3.5" /> Guardado
          </span>
        )}
      </div>
    </div>
  )
}
