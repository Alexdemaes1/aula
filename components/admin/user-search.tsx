'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

export function UserSearch({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  let timer: ReturnType<typeof setTimeout>

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    clearTimeout(timer)
    const value = e.target.value
    timer = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams()
        if (value) params.set('q', value)
        router.replace(`/admin/users?${params.toString()}`)
      })
    }, 300)
  }

  return (
    <input
      defaultValue={defaultValue}
      onChange={handleChange}
      placeholder="Buscar por nombre…"
      className="h-9 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring min-w-[220px]"
    />
  )
}
