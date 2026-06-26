'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCourseAction, updateCourseAction } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CourseCover } from '@/components/course-cover'
import { slugify, formatPrice } from '@/lib/utils/format'
import { Loader2, Save, Lock, LockOpen, Check, Star } from 'lucide-react'
import type { Course } from '@/types'
import { toast } from 'sonner'

const PALETTES = [
  { value: 'jade', label: 'Jade' },
  { value: 'qigong', label: 'Jade claro' },
  { value: 'cream', label: 'Crema' },
  { value: 'dark', label: 'Noche' },
  { value: 'medicina', label: 'Bosque' },
]
const CHAR_SUGGESTIONS = ['太', '氣', '禪', '武', '藥', '心', '道', '天']

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
  const [coverPalette, setCoverPalette] = useState(course?.cover_palette ?? 'jade')
  const [coverCharacter, setCoverCharacter] = useState(course?.cover_character ?? '')
  const [isFeatured, setIsFeatured] = useState(course?.is_featured ?? false)
  const [featuredOrder, setFeaturedOrder] = useState<string>(
    course?.featured_order != null ? String(course.featured_order) : ''
  )
  const [touched, setTouched] = useState(false)

  // Snapshot del último estado guardado para detectar cambios sin guardar.
  const snapshot = JSON.stringify({ title, slug, description, priceCents, currency, coverPalette, coverCharacter, isFeatured, featuredOrder })
  const [savedSnapshot, setSavedSnapshot] = useState(snapshot)
  const dirty = isEdit && snapshot !== savedSnapshot

  useEffect(() => {
    if (state?.error) toast.error(state.error)
    if (state?.success) {
      toast.success(state.success)
      setSavedSnapshot(snapshot)
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

      {/* Apariencia de la portada (sin foto) */}
      <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Label className="text-sm font-medium">Apariencia de la portada</Label>
          <span className="text-xs text-muted-foreground">Si subes una imagen en «Portada», esa manda</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-5 items-start">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="cover_palette" className="text-xs">Paleta</Label>
              <select
                id="cover_palette"
                name="cover_palette"
                value={coverPalette}
                onChange={(e) => setCoverPalette(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {PALETTES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cover_character" className="text-xs">Carácter (opcional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="cover_character"
                  name="cover_character"
                  value={coverCharacter}
                  onChange={(e) => setCoverCharacter(e.target.value)}
                  maxLength={4}
                  placeholder="天"
                  className="w-20 text-center text-lg"
                />
                <div className="flex flex-wrap gap-1">
                  {CHAR_SUGGESTIONS.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setCoverCharacter(c)}
                      className="size-8 rounded-md border text-base hover:bg-accent transition-colors"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Si lo dejas vacío, se usa 天 por defecto.</p>
            </div>
          </div>
          <div className="space-y-1.5 shrink-0">
            <span className="kicker">Vista previa</span>
            <CourseCover
              coverUrl={course?.cover_url ?? null}
              character={coverCharacter || null}
              palette={coverPalette}
              title={title || 'Vista previa'}
              className="w-44 aspect-video rounded-lg"
              charClassName="text-4xl"
            />
          </div>
        </div>
      </div>

      {/* Destacado en la home */}
      <div className="rounded-lg border p-4 space-y-3">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            name="is_featured"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="size-4 rounded border-input accent-[var(--primary)]"
          />
          <span className="flex items-center gap-1.5 text-sm font-medium">
            <Star className="size-4 text-brand-gold" /> Destacar en la home
          </span>
        </label>
        {isFeatured && (
          <div className="space-y-1.5 pl-7">
            <Label htmlFor="featured_order" className="text-xs">Orden (menor = primero)</Label>
            <Input
              id="featured_order"
              name="featured_order"
              type="number"
              min={0}
              value={featuredOrder}
              onChange={(e) => setFeaturedOrder(e.target.value)}
              placeholder="0"
              className="w-28"
            />
          </div>
        )}
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
