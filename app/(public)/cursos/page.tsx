import { Suspense } from 'react'
import { getUser } from '@/lib/auth'
import { CatalogSearch } from '@/components/catalog-search'
import { CatalogSort } from '@/components/catalog-sort'
import { CatalogCategoryFilter } from '@/components/catalog-category-filter'
import { CourseCatalog } from '@/components/course-catalog'
import { Breadcrumbs } from '@/components/breadcrumbs'

export const metadata = {
  title: 'Cursos online',
  description:
    'Explora todos los cursos de Tai Ji Quan, Qi Gong, meditación y medicina natural del Centro Tian Ying Fa con el Sifu Salvador Montiel.',
}

interface PageProps {
  searchParams: Promise<{ q?: string; sort?: string; category?: string }>
}

function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border bg-card overflow-hidden animate-pulse">
          <div className="aspect-video bg-muted" />
          <div className="p-5 space-y-3">
            <div className="h-5 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-9 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function CursosPage({ searchParams }: PageProps) {
  const [{ q, sort, category }, user] = await Promise.all([searchParams, getUser()])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <Breadcrumbs items={[{ label: 'Inicio', href: '/' }, { label: 'Cursos' }]} />

      <div className="mb-8 flex flex-col sm:flex-row sm:items-end gap-4 mt-4">
        <div>
          <p className="kicker mb-2">Formación online</p>
          <h1 className="font-heading font-semibold text-4xl tracking-tight">Todos los cursos</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            {q ? `Resultados para "${q}"` : 'Tai Ji, Qi Gong, meditación y medicina natural'}
          </p>
        </div>
        <div className="sm:ml-auto flex items-center gap-2">
          <Suspense>
            <CatalogSort />
          </Suspense>
          <Suspense>
            <CatalogSearch />
          </Suspense>
        </div>
      </div>

      <div className="mb-6">
        <Suspense>
          <CatalogCategoryFilter />
        </Suspense>
      </div>

      <Suspense key={`${q ?? ''}-${sort ?? ''}-${category ?? ''}`} fallback={<CatalogSkeleton />}>
        <CourseCatalog q={q} sort={sort} category={category} userId={user?.id} />
      </Suspense>
    </div>
  )
}
