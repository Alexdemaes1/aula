'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { CATEGORIES } from '@/lib/course-meta'
import { cn } from '@/lib/utils'

/** Chips para filtrar el catálogo por disciplina (vía ?category=). */
export function CatalogCategoryFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  const [, start] = useTransition()
  const current = sp.get('category') ?? ''

  function set(value: string) {
    const params = new URLSearchParams(sp.toString())
    if (!value) params.delete('category')
    else params.set('category', value)
    start(() => router.replace(`${pathname}?${params.toString()}`))
  }

  const chip = (active: boolean) =>
    cn(
      'px-3 py-1.5 rounded-full text-sm border transition-colors whitespace-nowrap',
      active ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'
    )

  return (
    <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrar por disciplina">
      <button type="button" onClick={() => set('')} className={chip(current === '')} aria-pressed={current === ''}>
        Todas
      </button>
      {CATEGORIES.map((c) => (
        <button
          key={c.value}
          type="button"
          onClick={() => set(c.value)}
          className={chip(current === c.value)}
          aria-pressed={current === c.value}
        >
          {c.label}
        </button>
      ))}
    </div>
  )
}
