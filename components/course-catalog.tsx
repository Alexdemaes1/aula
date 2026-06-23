import Link from 'next/link'
import { getPublishedCourses } from '@/lib/data/courses'
import { createAdminClient } from '@/lib/supabase/admin'
import { CourseCard } from '@/components/course-card'
import { BookOpen } from 'lucide-react'

interface Props {
  q?: string
  sort?: string
  userId?: string
}

export async function CourseCatalog({ q, sort, userId }: Props) {
  const db = createAdminClient()
  const validSort = sort === 'price_asc' || sort === 'price_desc' ? sort : 'newest'
  const [courses, { data: enrollments }] = await Promise.all([
    getPublishedCourses(q, validSort),
    userId
      ? db.from('enrollments').select('course_id').eq('user_id', userId).eq('status', 'active')
      : Promise.resolve({ data: [] as { course_id: string }[] }),
  ])
  const enrolledIds = new Set(enrollments?.map((e) => e.course_id) ?? [])

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <BookOpen className="size-12 text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-semibold">
          {q ? 'No se encontraron cursos' : 'Próximamente habrá cursos disponibles'}
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          {q ? 'Prueba con otro término de búsqueda.' : 'Vuelve pronto, estamos preparando el contenido.'}
        </p>
        {q && (
          <Link href="?" className="mt-4 text-sm text-primary underline hover:no-underline">
            Ver todos los cursos
          </Link>
        )}
      </div>
    )
  }

  return (
    <>
      <p className="text-sm text-muted-foreground mb-6">
        {courses.length} {courses.length === 1 ? 'curso disponible' : 'cursos disponibles'}
        {q ? ` para "${q}"` : ''}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            enrolled={enrolledIds.has(course.id)}
          />
        ))}
      </div>
    </>
  )
}
