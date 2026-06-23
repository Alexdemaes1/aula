import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { CourseForm } from '@/components/admin/course-form'
import { LessonManager } from '@/components/admin/lesson-manager'
import { CourseAnalytics } from '@/components/admin/course-analytics'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CoverUpload } from '@/components/admin/cover-upload'
import { DeleteCourseButton } from '@/components/admin/delete-course-button'
import { TogglePublishedButton } from '@/components/admin/toggle-published-button'

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

  const [{ data: course }, { data: lessons }, { count: enrolledCount }] = await Promise.all([
    db.from('courses').select('*').eq('id', id).single(),
    db.from('lessons').select('*').eq('course_id', id).order('position'),
    db.from('enrollments').select('*', { count: 'exact', head: true }).eq('course_id', id).eq('status', 'active'),
  ])

  if (!course) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground text-sm">/{course.slug}</p>
        </div>
        <TogglePublishedButton courseId={id} isPublished={course.is_published} />
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
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
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

        <TabsContent value="analytics" className="mt-6">
          <CourseAnalytics courseId={id} enrolledCount={enrolledCount ?? 0} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
