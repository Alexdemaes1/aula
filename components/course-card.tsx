import Link from 'next/link'
import { Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { CourseCover } from '@/components/course-cover'
import { formatPrice } from '@/lib/utils/format'
import { levelLabel, formatDuration } from '@/lib/course-meta'
import type { Course } from '@/types'

interface CourseCardProps {
  course: Course
  enrolled?: boolean
}

export function CourseCard({ course, enrolled }: CourseCardProps) {
  const isFree = course.price_cents === 0
  const level = levelLabel(course.level)
  const duration = formatDuration(course.duration_minutes)

  return (
    <Link href={`/courses/${course.slug}`} className="group block">
      <Card className="overflow-hidden h-full border-border/70 transition-all group-hover:shadow-md group-hover:-translate-y-0.5">
        <div className="relative">
          <CourseCover
            coverUrl={course.cover_url}
            character={course.cover_character}
            palette={course.cover_palette}
            title={course.title}
            className="aspect-video"
            charClassName="text-6xl"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {enrolled ? (
            <span className="absolute top-2.5 right-2.5 rounded-full bg-seal px-2.5 py-0.5 text-[11px] font-semibold text-cream shadow-sm">
              Matriculado
            </span>
          ) : isFree ? (
            <span className="absolute top-2.5 right-2.5 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 shadow-sm">
              Gratis
            </span>
          ) : null}
          {level && (
            <span className="absolute top-2.5 left-2.5 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium text-cream backdrop-blur-sm">
              {level}
            </span>
          )}
        </div>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-heading text-xl font-semibold leading-tight line-clamp-2">{course.title}</h3>
          {course.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5" />
              <span>
                {course.lesson_count} {course.lesson_count === 1 ? 'lección' : 'lecciones'}
                {duration ? ` · ${duration}` : ''}
              </span>
            </div>
            <span className={isFree ? 'font-bold text-sm text-emerald-600' : 'font-bold text-base'}>
              {isFree ? 'Gratis' : formatPrice(course.price_cents, course.currency)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
