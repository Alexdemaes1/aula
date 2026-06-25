'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCourseAction, updateCourseAction } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { slugify, formatPrice } from '@/lib/utils/format'
import { Loader2, Save, Lock, LockOpen, Check } from 'lucide-react'
import type { Course } from '@/types'
import { toast } from 'sonner'

interface CourseFormProps {
  course?: Course
}

const SLUG_RE = /^[a-z0-9-]+$/

export function CourseForm({ course }: CourseFormProps) {
  const isEdit = !!course
  const action = isEdit ? updateCourseAction : createCourseAction
  const [state, formAction, pending] = useActionState(action, null)
  const router = useRouter()

  const [title, setTitle] = useState(course?.title ?? '')
  const [slug, setSlug] = useState(course?.slug ?? '')
  const [autoSlug, setAutoSlug] = useState(!isEdit) // en edición no auto-pisar
  const [description, setDescription] = useState(course?.description ?? '')
  const [priceCents, setPriceCents] = useState(course?.price_cents ?? 0)
  const [currency, setCurrency] = useState(course?.currency ?? 'eur')
  const [touched, setTouched] = useState(false)

  // Snapshot del último estado guardado para detectar cambios sin guardar.
  const snapshot = JSON.stringify({ title, slug, description, priceCents, currency })
  const [savedSnapshot, setSavedSnapshot] = useState(snapshot)
  const dirty = isEdit && snapshot !== savedSnapshot

  useEffect(() => {
    if (state?.error) toast.error(state.error)
    if (state?.success) {
      toast.success(state.success)
      setSavedSnapshot(JSON.stringify({ title, slug, description, priceCents, currency }))
      router.refresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, router])

  function handleTitleChange(value: string) {
    setTitle(value)
    if (autoSlug) setSlug(slugify(value))
  }

  const titleError = touched && title.trim().length < 3 ? 'Mínimo 3 caracteres' : null
  const slugError = touched && (slug.length < 2 || !SLUG_RE.test(slug)) ? 'Solo minúsculas, números y guiones' : null
  const invalid = title.trim().length < 3 || slug.length < 2 || !SLUG_RE.test(slug)

  return (
    <form action={formAction} className="space-y-5" onSubmit={() => setTouched(true)}>
      {isEdit && <input type="hidden" name="id" value={course.id} />}

      <div className="space-y-2">
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          name="title"
          required
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="Ej: Fundamentos de Tai Ji"
          aria-invalid={!!titleError}
        />
        {titleError && <p className="text-xs text-destructive">{titleError}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug (URL) *</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground shrink-0">/courses/</span>
          <Input
            id="slug"
            name="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlug(slugify(e.target.value))
              setAutoSlug(false)
            }}
            placeholder="fundamentos-tai-ji"
            className="flex-1"
            aria-invalid={!!slugError}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 shrink-0"
            onClick={() => {
              const next = !autoSlug
              setAutoSlug(next)
              if (next) setSlug(slugify(title))
            }}
            title={autoSlug ? 'Slug automático desde el título (clic para editar a mano)' : 'Edición manual (clic para volver a automático)'}
          >
            {autoSlug ? <Lock className="size-4" /> : <LockOpen className="size-4" />}
          </Button>
        </div>
        {slugError && <p className="text-xs text-destructive">{slugError}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="description">Descripción</Label>
          <span className="text-xs text-muted-foreground">{description.length}/600</span>
        </div>
        <Textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          maxLength={600}
          placeholder="¿Qué aprenderán los alumnos?"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price_cents">Precio (céntimos)</Label>
          <Input
            id="price_cents"
            name="price_cents"
            type="number"
            min={0}
            value={priceCents}
            onChange={(e) => setPriceCents(Math.max(0, Number(e.target.value)))}
            placeholder="1999"
          />
          <p className="text-xs text-muted-foreground">
            {priceCents === 0 ? 'Curso gratuito' : `Se mostrará como ${formatPrice(priceCents, currency)}`}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Moneda</Label>
          <select
            id="currency"
            name="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="eur">EUR (€)</option>
            <option value="usd">USD ($)</option>
            <option value="gbp">GBP (£)</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={pending || invalid || (isEdit && !dirty)}>
          {pending ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
          {isEdit ? 'Guardar cambios' : 'Crear curso'}
        </Button>
        {isEdit && (
          dirty ? (
            <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-amber-500" />
              Cambios sin guardar
            </span>
          ) : (
            <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1.5">
              <Check className="size-3.5" />
              Guardado
            </span>
          )
        )}
      </div>
    </form>
  )
}
