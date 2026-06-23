'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition, useRef, useCallback, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CatalogSearch({ placeholder = 'Buscar cursos…' }: { placeholder?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Estado local para que el input sea responsive mientras el debounce espera
  const [localValue, setLocalValue] = useState(searchParams.get('q') ?? '')

  const navigate = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set('q', value)
      } else {
        params.delete('q')
      }
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`)
      })
    },
    [router, pathname, searchParams]
  )

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setLocalValue(value)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => navigate(value), 350)
  }

  function clear() {
    clearTimeout(timerRef.current)
    setLocalValue('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <div className="relative max-w-sm">
      <Search className={cn('absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground', isPending && 'animate-pulse')} />
      <Input
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-9 pr-8"
      />
      {localValue && (
        <button
          onClick={clear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Limpiar búsqueda"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
