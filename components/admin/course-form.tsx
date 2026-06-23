'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createCourseAction, updateCourseAction } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { slugify } from '@/lib/utils/format'
import { Loader2, Save } from 'lucide-react'
import type { Course } from '@/types'
import { toast } from 'sonner'

interface CourseFormProps {
  course?: Course
}

export function CourseForm({ course }: CourseFormProps) {
  const isEdit = !!course
  const action = isEdit ? updateCourseAction : createCourseAction
  const [state, formAction, pending] = useActionState(action, null)
  const slugRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (state?.error) toast.error(state.error)
    if (state?.success) {
      toast.success(state.success)
      router.refresh()
    }
  }, [state, router])

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!isEdit && slugRef.current && !slugRef.current.dataset.edited) {
      slugRef.current.value = slugify(e.target.value)
    }
  }

  return (
    <form action={formAction} className="space-y-5">
      {isEdit && <input type="hidden" name="id" value={course.id} />}

      <div className="space-y-2">
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={course?.title}
          placeholder="Ej: Fotografía digital para principiantes"
          onChange={handleTitleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug (URL) *</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">/courses/</span>
          <Input
            id="slug"
            name="slug"
            required
            ref={slugRef}
            defaultValue={course?.slug}
            placeholder="fotografia-digital"
            pattern="[a-z0-9-]+"
            title="Solo letras minúsculas, números y guiones"
            onInput={(e) => {
              (e.target as HTMLInputElement).dataset.edited = 'true'
            }}
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={course?.description}
          rows={4}
          placeholder="¿Qué aprenderán los alumnos?"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price_cents">Precio (céntimos de €)</Label>
          <Input
            id="price_cents"
            name="price_cents"
            type="number"
            min={0}
            defaultValue={course?.price_cents ?? 0}
            placeholder="1999 = 19,99 €"
          />
          <p className="text-xs text-muted-foreground">0 = curso gratuito</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Moneda</Label>
          <Input
            id="currency"
            name="currency"
            defaultValue={course?.currency ?? 'eur'}
            placeholder="eur"
            maxLength={3}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cover_url">URL de imagen de portada</Label>
        <Input
          id="cover_url"
          name="cover_url"
          type="url"
          defaultValue={course?.cover_url ?? ''}
          placeholder="https://ejemplo.com/imagen.jpg"
        />
        <p className="text-xs text-muted-foreground">Opcional. Imagen en formato 16:9 (ej: 1280×720 px).</p>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          id="is_published"
          name="is_published"
          value="true"
          defaultChecked={course?.is_published}
        />
        <Label htmlFor="is_published">Publicar curso (visible en el catálogo)</Label>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
          {isEdit ? 'Guardar cambios' : 'Crear curso'}
        </Button>
      </div>
    </form>
  )
}
