import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { CourseForm } from '@/components/admin/course-form'
import { LessonManager } from '@/components/admin/lesson-manager'
import { CourseAnalytics } from '@/components/admin/course-analytics'
import { QuizManager } from '@/components/admin/quiz-manager'
import { PublishChecklist } from '@/components/admin/publish-checklist'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CoverUpload } from '@/components/admin/cover-upload'
import { DeleteCourseButton } from '@/components/admin/delete-course-button'
import { TogglePublishedButton } from '@/components/admin/toggle-published-button'
import type { QuizQuestion } from '@/types'

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

  const [{ data: course }, { data: lessons }, { count: enrolledCount }, { data: quiz }] = await Promise.all([
    db.from('courses').select('*').eq('id', id).single(),
    db.from('lessons').select('*').eq('course_id', id).order('position'),
    db.from('enrollments').select('*', { count: 'exact', head: true }).eq('course_id', id).eq('status', 'active'),
    db.from('quizzes').select('*').eq('course_id', id).order('position').limit(1).maybeSingle(),
  ])

  if (!course) notFound()

  let questions: QuizQuestion[] = []
  if (quiz) {
    const { data } = await db
      .from('quiz_questions')
      .select('*, options:quiz_options(*)')
      .eq('quiz_id', quiz.id)
      .order('position')
    questions = (data ?? []).map((q) => ({
      ...q,
      options: (q.options ?? []).sort((a: { position: number }, b: { position: number }) => a.position - b.position),
    })) as QuizQuestion[]
  }

  const lessonList = lessons ?? []
  const hasCover = !!course.cover_url
  const priceConfigured = course.price_cents >= 0

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
          <TabsTrigger value="lessons">Lecciones ({lessonList.length})</TabsTrigger>
          <TabsTrigger value="quiz">Cuestionario ({questions.length})</TabsTrigger>
          <TabsTrigger value="cover">Portada</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="max-w-2xl">
              <CourseForm course={course} />
            </div>
            <PublishChecklist
              courseId={id}
              isPublished={course.is_published}
              hasCover={hasCover}
              lessonCount={lessonList.length}
              priceConfigured={priceConfigured}
              hasQuiz={questions.length > 0}
            />
          </div>
        </TabsContent>

        <TabsContent value="lessons" className="mt-6">
          <LessonManager courseId={id} lessons={lessonList} />
        </TabsContent>

        <TabsContent value="quiz" className="mt-6">
          <QuizManager
            courseId={id}
            course={{ title: course.title, description: course.description }}
            lessons={lessonList}
            quiz={quiz ?? null}
            questions={questions}
          />
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
