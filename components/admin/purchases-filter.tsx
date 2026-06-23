'use client'

import { useRouter } from 'next/navigation'

interface PurchasesFilterProps {
  courses: { id: string; title: string }[]
  selectedCourse?: string
  selectedEstado?: string
}

export function PurchasesFilter({ courses, selectedCourse, selectedEstado }: PurchasesFilterProps) {
  const router = useRouter()

  function update(key: string, value: string) {
    const params = new URLSearchParams(window.location.search)
    value ? params.set(key, value) : params.delete(key)
    router.replace(`/admin/purchases?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <select
        value={selectedCourse ?? ''}
        onChange={e => update('curso', e.target.value)}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
      >
        <option value="">Todos los cursos</option>
        {courses.map(c => (
          <option key={c.id} value={c.id}>{c.title}</option>
        ))}
      </select>
      <select
        value={selectedEstado ?? ''}
        onChange={e => update('estado', e.target.value)}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
      >
        <option value="">Todos los estados</option>
        <option value="active">Activa</option>
        <option value="refunded">Reembolsada</option>
      </select>
    </div>
  )
}
