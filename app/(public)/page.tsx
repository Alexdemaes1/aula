import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { CourseCard } from '@/components/course-card'
import { CatalogSearch } from '@/components/catalog-search'
import { BookOpen } from 'lucide-react'
import type { Course } from '@/types'

export const metadata = {
  title: 'Catálogo de cursos',
  description: 'Aprende a tu ritmo con nuestros cursos en línea.',
}

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const { q } = await searchParams
  const supabase = await createClient()
  const user = await getUser()

  let query = supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (q && q.trim()) {
    query = query.ilike('title', `%${q.trim()}%`)
  }

  const { data: courses } = await query

  // Obtener matrículas del usuario actual
  let enrolledIds = new Set<string>()
  if (user) {
    const adminClient = createAdminClient()
    const { data: enrollments } = await adminClient
      .from('enrollments')
      .select('course_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
    enrolledIds = new Set(enrollments?.map((e) => e.course_id) ?? [])
  }

  const list: Course[] = courses ?? []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catálogo de cursos</h1>
          <p className="text-muted-foreground mt-1">
            {list.length > 0
              ? `${list.length} ${list.length === 1 ? 'curso disponible' : 'cursos disponibles'}${q ? ` para "${q}"` : ''}`
              : q
              ? `Sin resultados para "${q}"`
              : 'Próximamente habrá cursos disponibles'}
          </p>
        </div>
        <div className="sm:ml-auto">
          <Suspense>
            <CatalogSearch />
          </Suspense>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <BookOpen className="size-12 text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-semibold">
            {q ? 'No se encontraron cursos' : 'Todavía no hay cursos publicados'}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {q ? 'Prueba con otro término de búsqueda.' : 'Vuelve pronto, estamos preparando el contenido.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              enrolled={enrolledIds.has(course.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
