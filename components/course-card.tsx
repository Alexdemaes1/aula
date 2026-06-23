import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils/format'
import type { Course } from '@/types'

interface CourseCardProps {
  course: Course
  enrolled?: boolean
}

export function CourseCard({ course, enrolled }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.slug}`} className="group block">
      <Card className="overflow-hidden h-full transition-all group-hover:shadow-md group-hover:-translate-y-0.5">
        <div className="aspect-video relative bg-muted overflow-hidden">
          {course.cover_url ? (
            <Image
              src={course.cover_url}
              alt={course.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-brand-dark to-brand-jade gap-2">
              <span className="text-3xl text-brand-gold/60 font-heading">天</span>
              <BookOpen className="size-6 text-white/20" />
            </div>
          )}
          {enrolled && (
            <div className="absolute top-2 right-2">
              <Badge className="text-xs">Matriculado</Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold leading-tight line-clamp-2">{course.title}</h3>
          {course.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
          )}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              <span>{course.lesson_count} {course.lesson_count === 1 ? 'lección' : 'lecciones'}</span>
            </div>
            <span className="font-bold text-sm">
              {formatPrice(course.price_cents, course.currency)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
