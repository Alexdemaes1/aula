import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { CourseForm } from '@/components/admin/course-form'
import { LessonManager } from '@/components/admin/lesson-manager'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CoverUpload } from '@/components/admin/cover-upload'
import { DeleteCourseButton } from '@/components/admin/delete-course-button'
import { Badge } from '@/components/ui/badge'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const db = createAdminClient()
  const { data } = await db.from('courses').select('title').eq('id', id).single()
  return { title: `${data?.title ?? 'Curso'} — Admin` }
}

export default async function EditCoursePage({ params }: PageProps) {
  const { id } = await params
  const db = createAdminClient()

  const { data: course } = await db.from('courses').select('*').eq('id', id).single()
  if (!course) notFound()

  const { data: lessons } = await db
    .from('lessons')
    .select('*')
    .eq('course_id', id)
    .order('position')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground text-sm">/{course.slug}</p>
        </div>
        <Badge variant={course.is_published ? 'default' : 'outline'}>
          {course.is_published ? 'Publicado' : 'Borrador'}
        </Badge>
        <div className="ml-auto">
          <DeleteCourseButton courseId={id} courseTitle={course.title} />
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="lessons">
            Lecciones ({lessons?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="cover">Portada</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6 max-w-2xl">
          <CourseForm course={course} />
        </TabsContent>

        <TabsContent value="lessons" className="mt-6">
          <LessonManager courseId={id} lessons={lessons ?? []} />
        </TabsContent>

        <TabsContent value="cover" className="mt-6 max-w-md">
          <CoverUpload courseId={id} currentUrl={course.cover_url} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
