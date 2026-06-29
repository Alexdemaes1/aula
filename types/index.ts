export type UserRole = 'admin' | 'student'
export type EnrollmentStatus = 'active' | 'refunded'
export type LessonContentType = 'video' | 'text'
export type QuizQuestionType = 'single' | 'multiple' | 'boolean'

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  created_at: string
}

// Paletas de portada sin foto (carácter chino + degradado por disciplina)
export type CoverPalette = 'jade' | 'qigong' | 'cream' | 'dark' | 'medicina'

export interface Course {
  id: string
  slug: string
  title: string
  description: string
  price_cents: number
  currency: string
  cover_url: string | null
  cover_character: string | null
  cover_palette: string
  category: string | null
  level: string | null
  duration_minutes: number | null
  learning_objectives: string | null
  is_featured: boolean
  featured_order: number | null
  is_published: boolean
  lesson_count: number
  created_at: string
}

export interface Lesson {
  id: string
  course_id: string
  title: string
  description: string
  content_type: LessonContentType
  youtube_video_id: string | null
  body: string | null
  position: number
  min_watch_seconds: number
  notes_pdf_path: string | null
  is_preview: boolean
  created_at: string
}

// ── Cuestionarios (autoevaluación opcional por curso) ──────
export interface Quiz {
  id: string
  course_id: string
  title: string
  description: string
  passing_score: number
  max_attempts: number | null
  required_for_completion: boolean
  position: number
  created_at: string
}

export interface QuizOption {
  id: string
  question_id: string
  label: string
  is_correct: boolean
  position: number
}

export interface QuizQuestion {
  id: string
  quiz_id: string
  prompt: string
  type: QuizQuestionType
  explanation: string
  position: number
  created_at: string
  options?: QuizOption[]
}

export interface QuizAttempt {
  id: string
  quiz_id: string
  user_id: string
  score: number
  passed: boolean
  answers: Record<string, string[]>
  submitted_at: string
}

export interface Enrollment {
  id: string
  user_id: string
  course_id: string
  status: EnrollmentStatus
  amount_paid_cents: number
  stripe_session_id: string | null
  purchased_at: string
}

export interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string
  watched_seconds: number
  last_position: number
  completed: boolean
  updated_at: string
}

// Tipos compuestos para consultas con joins
export interface CourseWithProgress extends Course {
  enrollments?: Enrollment[]
  lessons?: Lesson[]
}

export interface LessonWithProgress extends Lesson {
  lesson_progress?: LessonProgress[]
}
