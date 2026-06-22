import { CourseForm } from '@/components/admin/course-form'

export const metadata = { title: 'Nuevo curso — Admin' }

export default function NewCoursePage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nuevo curso</h1>
        <p className="text-muted-foreground">Rellena los datos del curso</p>
      </div>
      <CourseForm />
    </div>
  )
}
