import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { CourseCard } from '@/components/course-card'
import { CatalogSearch } from '@/components/catalog-search'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { BookOpen } from 'lucide-react'
import type { Course } from '@/types'

export const metadata = {
  title: 'Aula — Aprende a tu ritmo',
  description: 'Cursos en vídeo con seguimiento de progreso y materiales descargables.',
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
    <>
      {!user && (
        <section className="relative bg-slate-900 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(99,102,241,0.3),transparent)]" />
          <div className="relative max-w-4xl mx-auto px-6 py-24 sm:py-32 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70 mb-8">
              <BookOpen className="size-3.5" />
              Plataforma de formación online
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-tight mb-6">
              Aprende lo que quieras,{' '}
              <span className="text-indigo-400">cuando quieras.</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-xl mx-auto mb-10 leading-relaxed">
              Cursos en vídeo con seguimiento de progreso, materiales descargables y acceso de por vida.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register" className={cn(buttonVariants({ size: 'lg' }), 'text-base px-8')}>
                Empezar gratis
              </Link>
              <a
                href="#cursos"
                className="inline-flex items-center justify-center text-base px-8 h-11 rounded-md border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-colors"
              >
                Ver cursos
              </a>
            </div>
            <div className="mt-16 grid grid-cols-3 gap-6 max-w-xs mx-auto">
              <div className="text-center">
                <p className="text-2xl font-bold">&#8734;</p>
                <p className="text-xs text-slate-400 mt-1">Acceso vitalicio</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">HD</p>
                <p className="text-xs text-slate-400 mt-1">Vídeo HD</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">PDF</p>
                <p className="text-xs text-slate-400 mt-1">Materiales PDF</p>
              </div>
            </div>
          </div>
        </section>
      )}

      <div id="cursos" className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {user ? 'Catálogo de cursos' : 'Cursos disponibles'}
            </h2>
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
    </>
  )
}
