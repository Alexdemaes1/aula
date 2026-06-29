import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCourse } from '@/lib/data/courses'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { BuyButton } from '@/components/buy-button'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { PurchaseSuccessBanner } from '@/components/purchase-success-banner'
import { CourseCover } from '@/components/course-cover'
import { getCourseReviews, getMyReview } from '@/lib/data/reviews'
import { isFavorite } from '@/lib/data/favorites'
import { StarRating } from '@/components/star-rating'
import { ReviewForm } from '@/components/review-form'
import { FavoriteButton } from '@/components/favorite-button'
import { LessonPreviewButton } from '@/components/lesson-preview-button'
import { cn } from '@/lib/utils'
import { formatPrice, formatDate } from '@/lib/utils/format'
import { categoryLabel, levelLabel, formatDuration, parseObjectives } from '@/lib/course-meta'
import { Award, CheckCircle, Clock, Lock, ShieldCheck, BarChart3, GraduationCap } from 'lucide-react'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tianyingfa.vercel.app'

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
  const adminClient = createAdminClient()

  // Todas las queries en paralelo: lecciones (siempre), perfil+matrícula (solo si hay usuario)
  const [{ data: allLessons }, profileData, enrollmentData] = await Promise.all([
    adminClient
      .from('lessons')
      .select('id, title, position, is_preview, content_type, youtube_video_id')
      .eq('course_id', course.id)
      .order('position'),
    user
      ? adminClient.from('profiles').select('role').eq('id', user.id).single()
      : Promise.resolve({ data: null }),
    user
      ? adminClient
          .from('enrollments')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', course.id)
          .eq('status', 'active')
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  if (user) {
    isEnrolled = profileData.data?.role === 'admin' || !!enrollmentData.data
  }

  const lessons = allLessons ?? []
  const objectives = parseObjectives(course.learning_objectives)
  const level = levelLabel(course.level)
  const duration = formatDuration(course.duration_minutes)
  const category = categoryLabel(course.category)

  const { reviews, average, count } = await getCourseReviews(course.id)
  const myReview = user && isEnrolled ? await getMyReview(course.id, user.id) : null
  const favorited = user ? await isFavorite(user.id, course.id) : false

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description ?? '',
    image: course.cover_url ?? undefined,
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
      url: `${SITE_URL}/courses/${course.slug}`,
    },
    url: `${SITE_URL}/courses/${course.slug}`,
    numberOfCredits: lessons.length,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      instructor: {
        '@type': 'Person',
        name: 'Salvador Montiel',
        jobTitle: 'Sifu',
      },
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Cursos', item: `${SITE_URL}/cursos` },
      { '@type': 'ListItem', position: 3, name: course.title, item: `${SITE_URL}/courses/${course.slug}` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumbs
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Cursos', href: '/cursos' },
            { label: course.title },
          ]}
        />

        {compra === 'ok' && !isEnrolled && (
          <PurchaseSuccessBanner courseId={course.id} />
        )}

        {compra === 'cancelada' && (
          <div className="mb-6 rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800 flex items-center gap-3">
            <span>⚠️</span>
            <span>El pago fue cancelado. Puedes volver a intentarlo cuando quieras.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            <CourseCover
              coverUrl={course.cover_url}
              character={course.cover_character}
              palette={course.cover_palette}
              title={course.title}
              className="aspect-video rounded-xl"
              charClassName="text-8xl"
              sizes="(max-width: 1024px) 100vw, 66vw"
              priority
            />

            <div>
              <h1 className="font-heading font-semibold text-3xl sm:text-4xl tracking-tight">{course.title}</h1>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {category && <Badge variant="secondary">{category}</Badge>}
                <Badge variant="outline">
                  <Clock className="size-3 mr-1" />
                  {course.lesson_count} {course.lesson_count === 1 ? 'lección' : 'lecciones'}
                </Badge>
                {duration && (
                  <Badge variant="outline">
                    <Clock className="size-3 mr-1" />
                    {duration}
                  </Badge>
                )}
                {level && (
                  <Badge variant="outline">
                    <BarChart3 className="size-3 mr-1" />
                    {level}
                  </Badge>
                )}
              </div>
            </div>

            {course.description && (
              <div>
                <h2 className="font-semibold mb-2">Descripción</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{course.description}</p>
              </div>
            )}

            {objectives.length > 0 && (
              <div>
                <h2 className="font-semibold mb-3">Lo que aprenderás</h2>
                <ul className="grid sm:grid-cols-2 gap-2.5">
                  {objectives.map((o, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle className="size-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {lessons.length > 0 && (
              <div>
                <h2 className="font-semibold mb-3">
                  Contenido del curso
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    ({lessons.length} {lessons.length === 1 ? 'lección' : 'lecciones'})
                  </span>
                </h2>
                <div className="space-y-1">
                  {lessons.map((lesson, i) =>
                    isEnrolled ? (
                      <Link
                        key={lesson.id}
                        href={`/learn/${course.slug}/${lesson.id}`}
                        className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors group"
                      >
                        <span className="size-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-sm group-hover:underline">{lesson.title}</span>
                      </Link>
                    ) : (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 py-2 px-3 rounded-lg"
                      >
                        <span className="size-6 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center font-medium flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-sm text-muted-foreground">{lesson.title}</span>
                        {lesson.is_preview ? (
                          <LessonPreviewButton title={lesson.title} videoId={lesson.youtube_video_id} />
                        ) : (
                          <Lock className="size-3 ml-auto text-muted-foreground/40 flex-shrink-0" />
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Valoraciones */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <h2 className="font-semibold">Valoraciones</h2>
                {count > 0 && (
                  <div className="flex items-center gap-2">
                    <StarRating value={average} />
                    <span className="text-sm text-muted-foreground">
                      {average.toFixed(1)} · {count} {count === 1 ? 'reseña' : 'reseñas'}
                    </span>
                  </div>
                )}
              </div>
              {isEnrolled && (
                <div className="mb-5">
                  <ReviewForm
                    courseId={course.id}
                    initialRating={myReview?.rating ?? 0}
                    initialComment={myReview?.comment ?? ''}
                  />
                </div>
              )}
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Todavía no hay valoraciones.{isEnrolled ? ' Sé el primero en opinar.' : ''}
                </p>
              ) : (
                <ul className="space-y-4">
                  {reviews.map((r) => (
                    <li key={r.id} className="border-b border-border/60 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">{r.full_name}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span>
                      </div>
                      <StarRating value={r.rating} starClassName="size-3.5" className="my-1.5" />
                      {r.comment && <p className="text-sm text-muted-foreground leading-relaxed">{r.comment}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Instructor */}
            <div className="rounded-xl border bg-card p-5 flex items-start gap-4">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <GraduationCap className="size-6 text-primary" />
              </div>
              <div>
                <p className="kicker mb-1">Tu instructor</p>
                <h3 className="font-heading text-lg font-semibold">Sifu Salvador Montiel</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Más de 25 años enseñando Tai Ji Quan, Qi Gong, Kung Fu tradicional y medicina
                  china. Creador del sistema Biokinnetic, que integra la tradición oriental con la
                  salud natural moderna.
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground border-t pt-4 leading-relaxed">
              Aviso: los contenidos de este curso tienen fines educativos y de bienestar y no
              sustituyen el diagnóstico, tratamiento ni el consejo de un profesional sanitario.
              Consulta a tu médico antes de iniciar cualquier práctica física.
            </p>
          </div>

          {/* Panel lateral */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-xl border bg-card p-6 space-y-4 shadow-sm">
              <div>
                <div className="font-heading font-semibold text-4xl leading-none">
                  {course.price_cents === 0 ? 'Gratis' : formatPrice(course.price_cents, course.currency)}
                </div>
                <div className="text-xs text-muted-foreground mt-1.5">Pago único · acceso de por vida</div>
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

              {user && <FavoriteButton courseId={course.id} initialFavorited={favorited} />}

              <Separator />

              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2.5">
                  <CheckCircle className="size-4 text-emerald-600 flex-shrink-0" />
                  Acceso de por vida
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle className="size-4 text-emerald-600 flex-shrink-0" />
                  Vídeo bajo demanda HD
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle className="size-4 text-emerald-600 flex-shrink-0" />
                  Apuntes descargables
                </li>
                <li className="flex items-center gap-2.5">
                  <Award className="size-4 text-brand-gold flex-shrink-0" />
                  Certificado con sello del centro
                </li>
                {course.price_cents > 0 && (
                  <li className="flex items-center gap-2.5">
                    <ShieldCheck className="size-4 text-emerald-600 flex-shrink-0" />
                    Garantía de devolución de 14 días
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
