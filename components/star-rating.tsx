import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Estrellas de solo lectura. */
export function StarRating({
  value,
  className,
  starClassName = 'size-4',
}: {
  value: number
  className?: string
  starClassName?: string
}) {
  const rounded = Math.round(value)
  return (
    <div className={cn('flex items-center gap-0.5', className)} aria-label={`${value.toFixed(1)} de 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(starClassName, i <= rounded ? 'fill-brand-gold text-brand-gold' : 'fill-muted text-muted-foreground/30')}
        />
      ))}
    </div>
  )
}
