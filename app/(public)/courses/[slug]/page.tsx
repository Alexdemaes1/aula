import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCourse } from '@/lib/data/courses'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { BuyButton } from '@/components/buy-button'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/utils/format'
import { BookOpen, CheckCircle, Clock, Lock } from 'lucide-react'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aula-kappa-nine.vercel.app'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ compra?: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const course = await getCourse(slug)

  return {
    title: course?.title ?? 'Curso',
    description: course?.description,
    openGraph: {
      title: course?.title,
      description: course?.description ?? undefined,
      images: course?.cover_url ? [{ url: course.cover_url, width: 1280, height: 720 }] : [],
    },
  }
}

export default async function CourseDetailPage({ params, searchParams }: PageProps) {
  const [{ slug }, { compra }, user] = await Promise.all([
    params,
    searchParams,
    getUser(),
  ])

  const course = await getCourse(slug)
  if (!course) notFound()

  let isEnrolled = false
  let lessons: { id: string; title: string; position: number }[] = []

  if (user) {
    const adminClient = createAdminClient()
    const [{ data: profile }, { data: enrollment }] = await Promise.all([
      adminClient.from('profiles').select('role').eq('id', user.id).single(),
      adminClient
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', course.id)
        .eq('status', 'active')
        .maybeSingle(),
    ])
    isEnrolled = profile?.role === 'admin' || !!enrollment

    if (isEnrolled) {
      const { data } = await adminClient
        .from('lessons')
        .select('id, title, position')
        .eq('course_id', course.id)
        .order('position')
      lessons = data ?? []
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description ?? '',
    provider: {
      '@type': 'Organization',
      name: 'Tian Ying Fa',
      url: SITE_URL,
    },
    offers: {
      '@type': 'Offer',
      price: (course.price_cents / 100).toFixed(2),
      priceCurrency: (course.currency ?? 'eur').toUpperCase(),
      availability: 'https://schema.org/InStock',
    },
    url: `${SITE_URL}/courses/${course.slug}`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumbs
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Cursos', href: '/#cursos' },
            { label: course.title },
          ]}
        />

        {compra === 'ok' && !isEnrolled && (
          <div className="mb-6 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
            Pago recibido. Tu acceso se activará en unos segundos — recarga si no aparece el botón.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {course.cover_url ? (
              <div className="aspect-video relative rounded-xl overflow-hidden">
                <Image src={course.cover_url} alt={course.title} fill className="object-cover" />
              </div>
            ) : (
              <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <BookOpen className="size-16 text-primary/20" />
              </div>
            )}

            <div>
              <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="outline">
                  <Clock className="size-3 mr-1" />
                  {course.lesson_count} {course.lesson_count === 1 ? 'lección' : 'lecciones'}
                </Badge>
              </div>
            </div>

            {course.description && (
              <div>
                <h2 className="font-semibold mb-2">Descripción</h2>
                <p className="text-muted-foreground leading-relaxed">{course.description}</p>
              </div>
            )}

            {isEnrolled && lessons.length > 0 && (
              <div>
                <h2 className="font-semibold mb-3">Contenido del curso</h2>
                <div className="space-y-1">
                  {lessons.map((lesson, i) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/50"
                    >
                      <span className="size-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-sm">{lesson.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Panel lateral */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-xl border p-6 space-y-4 shadow-sm">
              <div className="text-3xl font-bold">
                {formatPrice(course.price_cents, course.currency)}
              </div>

              <Separator />

              {isEnrolled ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle className="size-4" />
                    Ya tienes acceso a este curso
                  </div>
                  <Link
                    href={`/learn/${course.slug}`}
                    className={cn(buttonVariants(), 'w-full')}
                  >
                    Ir al curso →
                  </Link>
                </div>
              ) : user ? (
                <div className="space-y-3">
                  <BuyButton
                    courseId={course.id}
                    price={formatPrice(course.price_cents, course.currency)}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Inicia sesión para comprar el curso
                  </p>
                  <Link
                    href={`/login?next=/courses/${course.slug}`}
                    className={cn(buttonVariants(), 'w-full')}
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/register"
                    className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
                  >
                    Crear cuenta
                  </Link>
                </div>
              )}

              <Separator />

              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600 flex-shrink-0" />
                  Acceso de por vida
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600 flex-shrink-0" />
                  Vídeo bajo demanda
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600 flex-shrink-0" />
                  Apuntes descargables
                </li>
                {!isEnrolled && (
                  <li className="flex items-center gap-2">
                    <Lock className="size-4 flex-shrink-0" />
                    Pago único, sin suscripción
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
