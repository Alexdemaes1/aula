'use client'

import { useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { toggleFavoriteAction } from '@/app/actions/favorites'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function FavoriteButton({
  courseId,
  initialFavorited,
}: {
  courseId: string
  initialFavorited: boolean
}) {
  const [fav, setFav] = useState(initialFavorited)
  const [pending, start] = useTransition()

  function toggle() {
    const optimistic = !fav
    setFav(optimistic)
    start(async () => {
      const r = await toggleFavoriteAction(courseId)
      if (r.error) {
        setFav(!optimistic)
        toast.error('No se pudo guardar')
      } else {
        setFav(r.favorited)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={fav}
      className={cn(
        'inline-flex items-center justify-center gap-2 w-full rounded-lg border h-10 text-sm font-medium transition-colors',
        fav ? 'border-seal/40 text-seal bg-seal/5' : 'hover:bg-accent'
      )}
    >
      <Heart className={cn('size-4', fav && 'fill-seal text-seal')} />
      {fav ? 'Guardado' : 'Guardar para después'}
    </button>
  )
}
