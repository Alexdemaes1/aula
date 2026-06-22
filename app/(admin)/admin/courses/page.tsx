import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Pencil } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils/format'

export const metadata = { title: 'Cursos — Admin' }

export default async function AdminCoursesPage() {
  const db = createAdminClient()
  const { data: courses } = await db
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cursos</h1>
          <p className="text-muted-foreground">{courses?.length ?? 0} cursos en total</p>
        </div>
        <Link href="/admin/courses/new" className={buttonVariants()}>
          <Plus className="size-4 mr-2" />
          Nuevo curso
        </Link>
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
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {!courses?.length ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No hay cursos todavía.{' '}
                  <Link href="/admin/courses/new" className="underline">
                    Crea el primero
                  </Link>
                </TableCell>
              </TableRow>
            ) : (
              courses.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell>{formatPrice(c.price_cents, c.currency)}</TableCell>
                  <TableCell>{c.lesson_count}</TableCell>
                  <TableCell>
                    <Badge variant={c.is_published ? 'default' : 'outline'}>
                      {c.is_published ? 'Publicado' : 'Borrador'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(c.created_at)}</TableCell>
                  <TableCell>
                    <Link href={`/admin/courses/${c.id}`} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                      <Pencil className="size-4" />
                    </Link>
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
