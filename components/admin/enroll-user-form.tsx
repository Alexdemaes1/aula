'use client'

import { useState, useTransition } from 'react'
import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { manualEnrollAction } from '@/app/actions/admin'
import { toast } from 'sonner'

interface EnrollUserFormProps {
  userId: string
  userName: string
  courses: { id: string; title: string }[]
}

export function EnrollUserForm({ userId, userName, courses }: EnrollUserFormProps) {
  const [open, setOpen] = useState(false)
  const [courseId, setCourseId] = useState('')
  const [pending, startTransition] = useTransition()

  function handleSubmit() {
    if (!courseId) return
    startTransition(async () => {
      const result = await manualEnrollAction(userId, courseId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Alumno matriculado correctamente')
        setOpen(false)
        setCourseId('')
      }
    })
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs"
        onClick={() => setOpen(true)}
        type="button"
      >
        <UserPlus className="size-3 mr-1" />
        Matricular
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Matriculación manual</DialogTitle>
            <DialogDescription>
              Inscribir a <strong>{userName}</strong> en un curso sin coste.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="course-select">Curso</Label>
            <select
              id="course-select"
              value={courseId}
              onChange={e => setCourseId(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Selecciona un curso…</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button size="sm" disabled={!courseId || pending} onClick={handleSubmit}>
              {pending ? 'Matriculando…' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
