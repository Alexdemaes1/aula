import { cn } from '@/lib/utils'

/** Divisor decorativo ───◆─── con rombo en oro de marca. */
export function SectionDivider({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center gap-3 my-6', className)} aria-hidden="true">
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-brand-gold/40" />
      <span className="text-brand-gold/70 text-xs">◆</span>
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-brand-gold/40" />
    </div>
  )
}
