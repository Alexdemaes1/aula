import { Suspense } from 'react'
import Link from 'next/link'
import { getUser } from '@/lib/auth'
import { CatalogSearch } from '@/components/catalog-search'
import { CourseCatalog } from '@/components/course-catalog'
import { Leaf, Brain, Heart, Video, FileDown, Award } from 'lucide-react'

export const metadata = {
  title: 'Aula — Cursos de meditación y vida saludable',
  description:
    'Aprende meditación, mindfulness y hábitos saludables con cursos en vídeo de instructores expertos. Acceso vitalicio, sin suscripción.',
}

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border bg-card overflow-hidden animate-pulse">
          <div className="aspect-video bg-muted" />
          <div className="p-4 space-y-3">
            <div className="h-5 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-9 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

const FEATURES = [
  {
    icon: Brain,
    title: 'Meditación guiada',
    desc: 'Técnicas probadas para calmar la mente y reducir el estrés en el día a día.',
  },
  {
    icon: Leaf,
    title: 'Vida saludable',
    desc: 'Hábitos que transforman tu bienestar físico y mental de forma duradera.',
  },
  {
    icon: Heart,
    title: 'Bienestar integral',
    desc: 'Un enfoque holístico que cuida tu cuerpo, tu mente y tu espíritu.',
  },
  {
    icon: Video,
    title: 'Vídeo HD on demand',
    desc: 'Aprende cuando quieras, desde donde quieras, al ritmo que más te convenga.',
  },
  {
    icon: FileDown,
    title: 'Apuntes descargables',
    desc: 'PDFs con resúmenes y ejercicios para reforzar el aprendizaje fuera de pantalla.',
  },
  {
    icon: Award,
    title: 'Certificado de finalización',
    desc: 'Acredita tu formación con un certificado oficial de Aula al completar el curso.',
  },
]

const TESTIMONIALS = [
  {
    body: 'Los cursos de meditación de Aula han cambiado completamente mi manera de gestionar el estrés. En tres semanas noté una diferencia enorme.',
    name: 'María González',
    role: 'Psicóloga clínica',
  },
  {
    body: 'La calidad del contenido es excepcional. Los vídeos son claros, los apuntes muy completos y la plataforma es muy fácil de usar.',
    name: 'Carlos Martínez',
    role: 'Ingeniero de software',
  },
  {
    body: 'Llevo años buscando un curso de alimentación consciente que fuera práctico y cercano. Por fin lo encontré. Totalmente recomendable.',
    name: 'Laura Sánchez',
    role: 'Nutricionista',
  },
]

const FAQ = [
  {
    q: '¿Cuánto tiempo tengo acceso a los cursos?',
    a: 'El acceso es de por vida. Una vez adquieres un curso, puedes verlo las veces que quieras, sin fecha de caducidad.',
  },
  {
    q: '¿Necesito conocimientos previos?',
    a: 'No. Todos nuestros cursos están diseñados para cualquier nivel. Cada curso indica claramente su nivel de dificultad.',
  },
  {
    q: '¿Puedo descargar los vídeos?',
    a: 'Los vídeos se visualizan en streaming. Sí puedes descargar los apuntes PDF de cada lección.',
  },
  {
    q: '¿Hay algún tipo de suscripción?',
    a: 'No. Cada curso se compra de forma independiente con un pago único. Sin sorpresas ni cargos recurrentes.',
  },
  {
    q: '¿Puedo pedir reembolso?',
    a: 'Sí, tienes 14 días desde la compra para solicitar un reembolso completo si no estás satisfecho.',
  },
]

export default async function HomePage({ searchParams }: PageProps) {
  const { q } = await searchParams
  const user = await getUser()

  return (
    <>
      {!user && (
        <>
          {/* Hero */}
          <section className="relative bg-slate-900 text-white overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(217,166,72,0.15),transparent)]" />
            <div className="relative max-w-4xl mx-auto px-6 py-24 sm:py-32 text-center">
              <div className="flex justify-center mb-8">
                <img
                  src="/logo.png"
                  alt="Aula"
                  className="size-24 object-contain drop-shadow-2xl"
                />
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-tight mb-6 font-heading">
                Encuentra tu centro.{' '}
                <span className="text-amber-400">Aprende a vivir mejor.</span>
              </h1>
              <p className="text-lg text-slate-300 max-w-xl mx-auto mb-10 leading-relaxed">
                Cursos de meditación, mindfulness y vida saludable con instructores expertos.
                Aprende a tu ritmo con acceso vitalicio.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center text-base px-8 h-11 rounded-md bg-amber-400 text-slate-900 font-semibold hover:bg-amber-300 transition-colors"
                >
                  Empezar gratis
                </Link>
                <a
                  href="#cursos"
                  className="inline-flex items-center justify-center text-base px-8 h-11 rounded-md border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-colors"
                >
                  Ver cursos
                </a>
              </div>
              <div className="mt-16 flex flex-wrap justify-center gap-10">
                {[
                  { value: '12+', label: 'Instructores expertos' },
                  { value: '500+', label: 'Alumnos activos' },
                  { value: '50h+', label: 'Contenido en vídeo' },
                  { value: '4.9/5', label: 'Valoración media' },
                ].map(({ value, label }) => (
                  <div key={label} className="text-center">
                    <p className="text-2xl font-bold text-amber-400">{value}</p>
                    <p className="text-xs text-slate-400 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-20 bg-background">
            <div className="max-w-6xl mx-auto px-6">
              <div className="text-center mb-14">
                <h2 className="text-3xl font-bold tracking-tight font-heading">
                  Todo lo que necesitas para transformar tu bienestar
                </h2>
                <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
                  Una plataforma diseñada para acompañarte en cada paso de tu camino hacia
                  una vida más consciente y saludable.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {FEATURES.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className="flex-shrink-0 size-10 rounded-lg bg-amber-400/10 flex items-center justify-center">
                      <Icon className="size-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Cómo funciona */}
          <section className="py-20 bg-muted/40">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <h2 className="text-3xl font-bold tracking-tight mb-4 font-heading">
                Empieza en tres pasos
              </h2>
              <p className="text-muted-foreground mb-14 max-w-xl mx-auto">
                Sin complicaciones. En menos de dos minutos puedes estar viendo tu primera lección.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {[
                  {
                    n: '1',
                    title: 'Crea tu cuenta',
                    desc: 'Regístrate gratis en menos de un minuto. Sin tarjeta de crédito.',
                  },
                  {
                    n: '2',
                    title: 'Elige tu curso',
                    desc: 'Explora el catálogo y selecciona el curso que más te inspire.',
                  },
                  {
                    n: '3',
                    title: 'Aprende a tu ritmo',
                    desc: 'Accede desde cualquier dispositivo, cuando tú quieras, sin límites.',
                  },
                ].map(({ n, title, desc }) => (
                  <div key={n} className="flex flex-col items-center">
                    <div className="size-14 rounded-full bg-amber-400 text-slate-900 text-xl font-bold flex items-center justify-center mb-4">
                      {n}
                    </div>
                    <h3 className="font-semibold mb-2">{title}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Catálogo */}
      <section id="cursos" className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {user ? 'Catálogo de cursos' : 'Cursos disponibles'}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {q
                ? `Resultados para "${q}"`
                : 'Meditación, mindfulness y vida saludable'}
            </p>
          </div>
          <div className="sm:ml-auto">
            <Suspense>
              <CatalogSearch />
            </Suspense>
          </div>
        </div>
        <Suspense fallback={<CatalogSkeleton />}>
          <CourseCatalog q={q} userId={user?.id} />
        </Suspense>
      </section>

      {!user && (
        <>
          {/* Testimonios */}
          <section className="py-20 bg-muted/40">
            <div className="max-w-6xl mx-auto px-6">
              <div className="text-center mb-14">
                <h2 className="text-3xl font-bold tracking-tight font-heading">
                  Lo que dicen nuestros alumnos
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {TESTIMONIALS.map(({ body, name, role }) => (
                  <div key={name} className="rounded-xl border bg-card p-6 space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <span className="text-amber-500 text-xl font-serif">"</span>
                      {body}
                      <span className="text-amber-500 text-xl font-serif">"</span>
                    </p>
                    <div>
                      <p className="font-semibold text-sm">{name}</p>
                      <p className="text-xs text-muted-foreground">{role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-20 bg-background">
            <div className="max-w-3xl mx-auto px-6">
              <h2 className="text-3xl font-bold tracking-tight text-center mb-12 font-heading">
                Preguntas frecuentes
              </h2>
              <div className="space-y-2">
                {FAQ.map(({ q: question, a }) => (
                  <details key={question} className="group border rounded-lg">
                    <summary className="flex justify-between items-center cursor-pointer px-5 py-4 font-medium text-sm select-none list-none [&::-webkit-details-marker]:hidden">
                      {question}
                      <span className="ml-4 flex-shrink-0 text-muted-foreground transition-transform group-open:rotate-180">
                        ▾
                      </span>
                    </summary>
                    <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                      {a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA final */}
          <section className="bg-slate-900 text-white py-20">
            <div className="max-w-2xl mx-auto px-6 text-center">
              <h2 className="text-3xl font-bold mb-4 font-heading">
                ¿Listo para transformar tu bienestar?
              </h2>
              <p className="text-slate-300 mb-8 leading-relaxed">
                Únete a más de 500 alumnos que ya están mejorando su vida con Aula.
                Tu camino hacia el bienestar empieza aquí.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center justify-center text-base px-8 h-11 rounded-md bg-amber-400 text-slate-900 font-semibold hover:bg-amber-300 transition-colors"
              >
                Empezar ahora — es gratis
              </Link>
            </div>
          </section>
        </>
      )}
    </>
  )
}
