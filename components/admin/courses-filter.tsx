'use client'

import { useRouter } from 'next/navigation'

export function CoursesFilter({ value }: { value?: string }) {
  const router = useRouter()
  return (
    <select
      value={value ?? ''}
      onChange={(e) => {
        const v = e.target.value
        router.replace(v ? `/admin/courses?estado=${v}` : '/admin/courses')
      }}
      className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
    >
      <option value="">Todos</option>
      <option value="publicados">Publicados</option>
      <option value="borradores">Borradores</option>
    </select>
  )
}
