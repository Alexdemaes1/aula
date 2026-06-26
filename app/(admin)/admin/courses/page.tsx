import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { buttonVariants } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Pencil, ExternalLink, Star } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils/format'
import { TogglePublishedButton } from '@/components/admin/toggle-published-button'
import { CoursesFilter } from '@/components/admin/courses-filter'

export const metadata = { title: 'Cursos — Admin' }

interface PageProps {
  searchParams: Promise<{ estado?: string }>
}

export default async function AdminCoursesPage({ searchParams }: PageProps) {
  const { estado } = await searchParams
  const db = createAdminClient()
  const { data: allCourses } = await db.from('courses').select('*').order('created_at', { ascending: false })

  const courses = allCourses ?? []
  const publishedCount = courses.filter((c) => c.is_published).length
  const draftCount = courses.length - publishedCount

  const filtered =
    estado === 'publicados' ? courses.filter((c) => c.is_published)
    : estado === 'borradores' ? courses.filter((c) => !c.is_published)
    : courses

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="kicker mb-1.5">Catálogo</p>
          <h1 className="font-heading text-3xl font-semibold">Cursos</h1>
          <p className="text-muted-foreground mt-0.5">
            {courses.length} en total · <span className="text-primary">{publishedCount} publicados</span> · {draftCount} borradores
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CoursesFilter value={estado} />
          <Link href="/admin/courses/new" className={buttonVariants()}>
            <Plus className="size-4 mr-2" />
            Nuevo curso
          </Link>
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Lecciones</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  {courses.length === 0 ? (
                    <>No hay cursos todavía. <Link href="/admin/courses/new" className="underline">Crea el primero</Link></>
                  ) : (
                    'No hay cursos con este filtro.'
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span
                        className={`size-2 rounded-full shrink-0 ${c.is_published ? 'bg-green-500' : 'bg-muted-foreground/40'}`}
                        title={c.is_published ? 'Publicado' : 'Borrador'}
                      />
                      <span>{c.title}</span>
                      {c.is_featured && (
                        <Star className="size-3.5 fill-brand-gold text-brand-gold shrink-0" aria-label="Destacado" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatPrice(c.price_cents, c.currency)}</TableCell>
                  <TableCell>{c.lesson_count}</TableCell>
                  <TableCell>
                    <TogglePublishedButton courseId={c.id} isPublished={c.is_published} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(c.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-0.5">
                      {c.is_published && (
                        <Link
                          href={`/courses/${c.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                          title="Ver en catálogo"
                        >
                          <ExternalLink className="size-4" />
                        </Link>
                      )}
                      <Link href={`/admin/courses/${c.id}`} className={buttonVariants({ variant: 'ghost', size: 'sm' })} title="Editar">
                        <Pencil className="size-4" />
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
