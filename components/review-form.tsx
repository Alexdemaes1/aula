'use client'

import { useActionState, useEffect, useState } from 'react'
import { upsertReviewAction } from '@/app/actions/reviews'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Star, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function ReviewForm({
  courseId,
  initialRating = 0,
  initialComment = '',
}: {
  courseId: string
  initialRating?: number
  initialComment?: string
}) {
  const [state, action, pending] = useActionState(upsertReviewAction, null)
  const [rating, setRating] = useState(initialRating)
  const [hover, setHover] = useState(0)

  useEffect(() => {
    if (state?.error) toast.error(state.error)
    if (state?.success) toast.success(state.success)
  }, [state])

  return (
    <form action={action} className="rounded-xl border bg-card p-5 space-y-3">
      <input type="hidden" name="course_id" value={courseId} />
      <input type="hidden" name="rating" value={rating} />
      <p className="text-sm font-medium">{initialRating ? 'Tu valoración' : 'Deja tu valoración'}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            type="button"
            key={i}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(i)}
            aria-label={`${i} ${i === 1 ? 'estrella' : 'estrellas'}`}
            className="outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            <Star
              className={cn(
                'size-6 transition-colors',
                i <= (hover || rating) ? 'fill-brand-gold text-brand-gold' : 'text-muted-foreground/30'
              )}
            />
          </button>
        ))}
      </div>
      <Textarea
        name="comment"
        defaultValue={initialComment}
        rows={3}
        maxLength={1000}
        placeholder="¿Qué te ha parecido el curso? (opcional)"
      />
      <Button type="submit" size="sm" disabled={pending || rating === 0}>
        {pending ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
        {initialRating ? 'Actualizar reseña' : 'Publicar reseña'}
      </Button>
    </form>
  )
}
