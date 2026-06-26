import { CourseForm } from '@/components/admin/course-form'

export const metadata = { title: 'Nuevo curso — Admin' }

export default function NewCoursePage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="kicker mb-1.5">Catálogo</p>
        <h1 className="font-heading text-3xl font-semibold">Nuevo curso</h1>
        <p className="text-muted-foreground mt-0.5">Rellena los datos del curso</p>
      </div>
      <CourseForm />
    </div>
  )
}
